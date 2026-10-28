import type { NextApiRequest, NextApiResponse } from "next";
import { Pet, Tutor, FotoDto } from "@/types";
import { petsIniciais, tutoresIniciais, vinculosIniciais } from "@/mock/dados";
import { ARQUIVO_FOTO, TipoFoto, gerarSvg, montarFoto } from "@/mock/fotos";
import { EXPIRA_ACCESS, EXPIRA_REFRESH, gerarToken, validarToken } from "@/mock/tokens";

// API simulada do modo demonstracao (NEXT_PUBLIC_URL_BACKEND=/api/mock).
// O estado fica em memoria no modulo: reinicia a cada cold start da funcao
// serverless e pode divergir entre instancias. Tokens sao assinados e nao
// dependem desse estado.

export const config = {
    api: { bodyParser: false },
};

const USUARIO_DEMO = { username: "admin", password: "admin" };
const LIMITE_CORPO = 4 * 1024 * 1024;

type PetReg = Omit<Pet, "tutores">;
type TutorReg = Omit<Tutor, "pets">;

interface Estado {
    pets: PetReg[];
    tutores: TutorReg[];
    vinculos: Array<[number, number]>; // [tutorId, petId]
    proximoPet: number;
    proximoTutor: number;
    proximaFoto: number;
}

class ErroHttp extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

function criarEstado(): Estado {
    let fotoId = 1;
    const pets: PetReg[] = petsIniciais.map(({ comFoto, ...pet }) => ({
        ...pet,
        ...(comFoto && { foto: montarFoto("pet", pet.id, 0, fotoId++) }),
    }));
    const tutores: TutorReg[] = tutoresIniciais.map(({ comFoto, ...tutor }) => ({
        ...tutor,
        ...(comFoto && { foto: montarFoto("tutor", tutor.id, 0, fotoId++) }),
    }));
    return {
        pets,
        tutores,
        vinculos: vinculosIniciais.map(([t, p]) => [t, p] as [number, number]),
        proximoPet: pets.length + 1,
        proximoTutor: tutores.length + 1,
        proximaFoto: fotoId,
    };
}

const escopo = globalThis as typeof globalThis & { __petManagerMock?: Estado };
const estado: Estado = (escopo.__petManagerMock ??= criarEstado());

function semAcento(texto: string): string {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function lerCorpo(req: NextApiRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const partes: Buffer[] = [];
        let total = 0;
        req.on("data", (parte: Buffer) => {
            total += parte.length;
            if (total <= LIMITE_CORPO) partes.push(parte);
        });
        req.on("end", () => {
            if (total > LIMITE_CORPO) reject(new ErroHttp(413, "Corpo da requisição grande demais."));
            else resolve(Buffer.concat(partes as unknown as Uint8Array[]));
        });
        req.on("error", reject);
    });
}

function interpretarJson(corpo: Buffer): Record<string, unknown> {
    if (corpo.length === 0) return {};
    try {
        const json = JSON.parse(corpo.toString("utf8"));
        if (json && typeof json === "object" && !Array.isArray(json)) return json;
    } catch {
        // cai no erro abaixo
    }
    throw new ErroHttp(400, "JSON inválido.");
}

function exigirAutenticacao(req: NextApiRequest): string {
    const cabecalho = req.headers.authorization || "";
    const [esquema, token] = cabecalho.split(" ");
    if (esquema !== "Bearer" || !token) throw new ErroHttp(401, "Não autenticado.");
    const payload = validarToken(token, "access");
    if (!payload) throw new ErroHttp(401, "Token inválido ou expirado.");
    return payload.sub;
}

function texto(valor: unknown, campo: string, obrigatorio = true): string | undefined {
    if (valor === undefined || valor === null || valor === "") {
        if (obrigatorio) throw new ErroHttp(400, `O campo '${campo}' é obrigatório.`);
        return undefined;
    }
    if (typeof valor !== "string") throw new ErroHttp(400, `O campo '${campo}' deve ser texto.`);
    return valor.trim();
}

function idade(valor: unknown): number {
    const numero = Number(valor);
    if (valor === undefined || valor === null || valor === "" || !Number.isInteger(numero) || numero < 0) {
        throw new ErroHttp(400, "O campo 'idade' deve ser um número inteiro maior ou igual a zero.");
    }
    return numero;
}

function parseId(valor: string | undefined): number {
    const numero = Number(valor);
    if (!valor || !Number.isInteger(numero) || numero < 1) throw new ErroHttp(400, "Identificador inválido.");
    return numero;
}

function buscarPet(id: number): PetReg {
    const pet = estado.pets.find((p) => p.id === id);
    if (!pet) throw new ErroHttp(404, "Pet não encontrado.");
    return pet;
}

function buscarTutor(id: number): TutorReg {
    const tutor = estado.tutores.find((t) => t.id === id);
    if (!tutor) throw new ErroHttp(404, "Tutor não encontrado.");
    return tutor;
}

function tutoresDoPet(petId: number): TutorReg[] {
    return estado.vinculos
        .filter(([, p]) => p === petId)
        .map(([t]) => estado.tutores.find((tutor) => tutor.id === t))
        .filter((t): t is TutorReg => !!t);
}

function petsDoTutor(tutorId: number): PetReg[] {
    return estado.vinculos
        .filter(([t]) => t === tutorId)
        .map(([, p]) => estado.pets.find((pet) => pet.id === p))
        .filter((p): p is PetReg => !!p);
}

function paginar<T>(itens: T[], query: NextApiRequest["query"]) {
    const pagina = Number(query.page);
    const tamanho = Number(query.size);
    const page = Number.isInteger(pagina) && pagina >= 0 ? pagina : 0;
    const size = Number.isInteger(tamanho) && tamanho >= 1 ? Math.min(tamanho, 100) : 10;
    const total = itens.length;
    const pageCount = Math.ceil(total / size);
    return {
        page,
        size,
        total,
        pageCount,
        number: page,
        totalElements: total,
        totalPages: pageCount,
        content: itens.slice(page * size, (page + 1) * size),
    };
}

function filtrarPorNome<T extends { nome: string }>(itens: T[], query: NextApiRequest["query"]): T[] {
    const nome = typeof query.nome === "string" ? semAcento(query.nome.trim()) : "";
    return nome ? itens.filter((item) => semAcento(item.nome).includes(nome)) : itens;
}

function nomeDoArquivo(corpo: Buffer): string | undefined {
    const cabecalho = corpo.toString("latin1", 0, Math.min(corpo.length, 1024));
    return /filename="([^"\r\n]*)"/.exec(cabecalho)?.[1] || undefined;
}

function registrarFoto(tipo: TipoFoto, reg: PetReg | TutorReg, corpo: Buffer, contentType: string) {
    if (!contentType.startsWith("multipart/form-data") || !corpo.toString("latin1").includes('name="foto"')) {
        throw new ErroHttp(400, "Envie o arquivo no campo multipart 'foto'.");
    }
    const atual = typeof reg.foto === "object" ? ARQUIVO_FOTO.exec(reg.foto.url.split("/").pop() || "") : null;
    const versao = atual ? Number(atual[3]) + 1 : 1;
    // O conteudo enviado nao e gravado: a foto passa a ser uma ilustracao em SVG
    const foto: FotoDto = montarFoto(tipo, reg.id, versao, estado.proximaFoto++, nomeDoArquivo(corpo));
    reg.foto = foto;
    return foto;
}

async function rotear(req: NextApiRequest, res: NextApiResponse, segmentos: string[]) {
    const metodo = req.method || "GET";
    const [recurso, a, b, c, d] = segmentos;

    // Fotos ilustrativas (publicas, o <img> nao envia Authorization)
    if (recurso === "fotos" && a && !b) {
        const partes = ARQUIVO_FOTO.exec(a);
        if (metodo !== "GET" || !partes) throw new ErroHttp(404, "Recurso não encontrado.");
        const tipo = partes[1] as TipoFoto;
        const id = Number(partes[2]);
        const reg = tipo === "pet" ? estado.pets.find((p) => p.id === id) : estado.tutores.find((t) => t.id === id);
        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=300");
        return res.status(200).send(gerarSvg(tipo, id, reg?.nome ?? "Pet Manager"));
    }

    if (recurso === "autenticacao" && a === "login" && !b) {
        if (metodo !== "POST") throw new ErroHttp(405, "Método não permitido.");
        const corpo = interpretarJson(await lerCorpo(req));
        if (corpo.username !== USUARIO_DEMO.username || corpo.password !== USUARIO_DEMO.password) {
            throw new ErroHttp(401, "Usuário ou senha inválidos.");
        }
        return res.status(200).json({
            access_token: gerarToken(USUARIO_DEMO.username, "access"),
            refresh_token: gerarToken(USUARIO_DEMO.username, "refresh"),
            expires_in: EXPIRA_ACCESS,
            refresh_expires_in: EXPIRA_REFRESH,
        });
    }

    if (recurso === "autenticacao" && a === "refresh" && !b) {
        if (metodo !== "PUT" && metodo !== "POST") throw new ErroHttp(405, "Método não permitido.");
        const [esquema, token] = (req.headers.authorization || "").split(" ");
        const payload = esquema === "Bearer" && token ? validarToken(token, "refresh") : null;
        if (!payload) throw new ErroHttp(401, "Refresh token inválido ou expirado.");
        return res.status(200).json({
            access_token: gerarToken(payload.sub, "access"),
            refresh_token: gerarToken(payload.sub, "refresh"),
            expires_in: EXPIRA_ACCESS,
            refresh_expires_in: EXPIRA_REFRESH,
        });
    }

    if (recurso === "v1" && (a === "pets" || a === "tutores")) {
        exigirAutenticacao(req);
        return a === "pets" ? rotearPets(req, res, metodo, b, c) : rotearTutores(req, res, metodo, b, c, d);
    }

    throw new ErroHttp(404, "Recurso não encontrado.");
}

async function rotearPets(
    req: NextApiRequest,
    res: NextApiResponse,
    metodo: string,
    idTexto?: string,
    sub?: string
) {
    if (!idTexto) {
        if (metodo === "GET") {
            return res.status(200).json(paginar(filtrarPorNome(estado.pets, req.query), req.query));
        }
        if (metodo === "POST") {
            const corpo = interpretarJson(await lerCorpo(req));
            const pet: PetReg = {
                id: 0,
                nome: texto(corpo.nome, "nome")!,
                idade: idade(corpo.idade),
                raca: texto(corpo.raca, "raca")!,
            };
            pet.id = estado.proximoPet++;
            estado.pets.push(pet);
            return res.status(201).json({ ...pet, tutores: [] });
        }
        throw new ErroHttp(405, "Método não permitido.");
    }

    const id = parseId(idTexto);

    if (!sub) {
        if (metodo === "GET") {
            return res.status(200).json({ ...buscarPet(id), tutores: tutoresDoPet(id) });
        }
        if (metodo === "PUT") {
            const pet = buscarPet(id);
            const corpo = interpretarJson(await lerCorpo(req));
            if (corpo.nome !== undefined) pet.nome = texto(corpo.nome, "nome")!;
            if (corpo.idade !== undefined) pet.idade = idade(corpo.idade);
            if (corpo.raca !== undefined) pet.raca = texto(corpo.raca, "raca")!;
            return res.status(200).json({ ...pet, tutores: tutoresDoPet(id) });
        }
        if (metodo === "DELETE") {
            buscarPet(id);
            estado.pets = estado.pets.filter((p) => p.id !== id);
            estado.vinculos = estado.vinculos.filter(([, p]) => p !== id);
            return res.status(204).end();
        }
        throw new ErroHttp(405, "Método não permitido.");
    }

    if (sub === "fotos") {
        if (metodo !== "POST") throw new ErroHttp(405, "Método não permitido.");
        const pet = buscarPet(id);
        const corpo = await lerCorpo(req);
        return res.status(201).json(registrarFoto("pet", pet, corpo, req.headers["content-type"] || ""));
    }

    throw new ErroHttp(404, "Recurso não encontrado.");
}

async function rotearTutores(
    req: NextApiRequest,
    res: NextApiResponse,
    metodo: string,
    idTexto?: string,
    sub?: string,
    petIdTexto?: string
) {
    if (!idTexto) {
        if (metodo === "GET") {
            return res.status(200).json(paginar(filtrarPorNome(estado.tutores, req.query), req.query));
        }
        if (metodo === "POST") {
            const corpo = interpretarJson(await lerCorpo(req));
            const tutor: TutorReg = {
                id: 0,
                nome: texto(corpo.nome, "nome")!,
                telefone: texto(corpo.telefone, "telefone")!,
                endereco: texto(corpo.endereco, "endereco")!,
                email: texto(corpo.email, "email", false),
                cpf: texto(corpo.cpf, "cpf", false),
            };
            tutor.id = estado.proximoTutor++;
            estado.tutores.push(tutor);
            return res.status(201).json({ ...tutor, pets: [] });
        }
        throw new ErroHttp(405, "Método não permitido.");
    }

    const id = parseId(idTexto);

    if (!sub) {
        if (metodo === "GET") {
            return res.status(200).json({ ...buscarTutor(id), pets: petsDoTutor(id) });
        }
        if (metodo === "PUT") {
            const tutor = buscarTutor(id);
            const corpo = interpretarJson(await lerCorpo(req));
            if (corpo.nome !== undefined) tutor.nome = texto(corpo.nome, "nome")!;
            if (corpo.telefone !== undefined) tutor.telefone = texto(corpo.telefone, "telefone")!;
            if (corpo.endereco !== undefined) tutor.endereco = texto(corpo.endereco, "endereco")!;
            if (corpo.email !== undefined) tutor.email = texto(corpo.email, "email", false);
            if (corpo.cpf !== undefined) tutor.cpf = texto(corpo.cpf, "cpf", false);
            return res.status(200).json({ ...tutor, pets: petsDoTutor(id) });
        }
        if (metodo === "DELETE") {
            buscarTutor(id);
            estado.tutores = estado.tutores.filter((t) => t.id !== id);
            estado.vinculos = estado.vinculos.filter(([t]) => t !== id);
            return res.status(204).end();
        }
        throw new ErroHttp(405, "Método não permitido.");
    }

    if (sub === "fotos" && !petIdTexto) {
        if (metodo !== "POST") throw new ErroHttp(405, "Método não permitido.");
        const tutor = buscarTutor(id);
        const corpo = await lerCorpo(req);
        return res.status(201).json(registrarFoto("tutor", tutor, corpo, req.headers["content-type"] || ""));
    }

    if (sub === "pets" && petIdTexto) {
        const petId = parseId(petIdTexto);
        if (metodo === "POST") {
            buscarTutor(id);
            buscarPet(petId);
            if (!estado.vinculos.some(([t, p]) => t === id && p === petId)) estado.vinculos.push([id, petId]);
            return res.status(204).end();
        }
        if (metodo === "DELETE") {
            buscarTutor(id);
            buscarPet(petId);
            estado.vinculos = estado.vinculos.filter(([t, p]) => !(t === id && p === petId));
            return res.status(204).end();
        }
        throw new ErroHttp(405, "Método não permitido.");
    }

    throw new ErroHttp(404, "Recurso não encontrado.");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const caminho = req.query.path;
    const segmentos = Array.isArray(caminho) ? caminho : caminho ? [caminho] : [];

    try {
        await rotear(req, res, segmentos);
    } catch (error) {
        if (res.headersSent) return;
        const status = error instanceof ErroHttp ? error.status : 500;
        const message = error instanceof ErroHttp ? error.message : "Erro interno do mock.";
        res.status(status).json({ status, message });
    }
}
