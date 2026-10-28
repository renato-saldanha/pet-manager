import { FotoDto } from "@/types";

export type TipoFoto = "pet" | "tutor";

export const ARQUIVO_FOTO = /^(pet|tutor)-(\d+)-v(\d+)\.svg$/;

function escapar(texto: string): string {
    return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Termina em .svg para o next/image servir o arquivo sem tentar otimizar.
export function montarFoto(tipo: TipoFoto, id: number, versao: number, fotoId: number, nome?: string): FotoDto {
    const arquivo = `${tipo}-${id}-v${versao}.svg`;
    return {
        id: fotoId,
        nome: nome || arquivo,
        contentType: "image/svg+xml",
        url: `/api/mock/fotos/${arquivo}`,
    };
}

export function gerarSvg(tipo: TipoFoto, id: number, rotulo: string): string {
    const matiz = (id * 47 + (tipo === "pet" ? 0 : 150)) % 360;
    const figura =
        tipo === "pet"
            ? `<ellipse cx="200" cy="245" rx="62" ry="50" fill="#fff" fill-opacity=".9"/>
  <ellipse cx="120" cy="170" rx="24" ry="32" fill="#fff" fill-opacity=".9"/>
  <ellipse cx="170" cy="125" rx="24" ry="32" fill="#fff" fill-opacity=".9"/>
  <ellipse cx="230" cy="125" rx="24" ry="32" fill="#fff" fill-opacity=".9"/>
  <ellipse cx="280" cy="170" rx="24" ry="32" fill="#fff" fill-opacity=".9"/>`
            : `<circle cx="200" cy="140" r="52" fill="#fff" fill-opacity=".9"/>
  <path d="M96 290c0-62 46-100 104-100s104 38 104 100z" fill="#fff" fill-opacity=".9"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${escapar(rotulo)}">
  <defs>
    <linearGradient id="fundo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${matiz} 65% 62%)"/>
      <stop offset="1" stop-color="hsl(${(matiz + 40) % 360} 60% 42%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#fundo)"/>
  ${figura}
  <text x="200" y="352" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="bold" fill="#fff">${escapar(rotulo)}</text>
</svg>`;
}
