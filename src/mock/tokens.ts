import { createHmac, timingSafeEqual } from "crypto";

// Tokens assinados (HS256) sem estado em memoria: continuam validos mesmo que
// a funcao serverless reinicie ou que outra instancia atenda a requisicao.
const SEGREDO = "pet-manager-demo-segredo-publico";

export const EXPIRA_ACCESS = 300;
export const EXPIRA_REFRESH = 86400;

export type TipoToken = "access" | "refresh";

interface Payload {
    sub: string;
    typ: TipoToken;
    iat: number;
    exp: number;
}

function base64url(valor: string): string {
    return Buffer.from(valor).toString("base64url");
}

function assinar(conteudo: string): string {
    return createHmac("sha256", SEGREDO).update(conteudo).digest("base64url");
}

export function gerarToken(sub: string, typ: TipoToken): string {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (typ === "access" ? EXPIRA_ACCESS : EXPIRA_REFRESH);
    const cabecalho = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const corpo = base64url(JSON.stringify({ sub, typ, iat, exp } satisfies Payload));
    const conteudo = `${cabecalho}.${corpo}`;
    return `${conteudo}.${assinar(conteudo)}`;
}

export function validarToken(token: string, tipo: TipoToken): Payload | null {
    const partes = token.split(".");
    if (partes.length !== 3) return null;

    const esperada = assinar(`${partes[0]}.${partes[1]}`);
    const recebida = partes[2];
    if (esperada.length !== recebida.length) return null;
    if (!timingSafeEqual(new Uint8Array(Buffer.from(esperada)), new Uint8Array(Buffer.from(recebida)))) return null;

    try {
        const payload = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8")) as Payload;
        if (payload.typ !== tipo) return null;
        if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}
