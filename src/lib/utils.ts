import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai a URL da foto, seja ela uma string direta ou um objeto FotoDto
 * @param foto - Pode ser string (URL) ou objeto FotoDto
 * @returns URL da foto ou null se inválida
 */
export function getFotoUrl(foto: unknown): string | null {
  if (!foto) return null;
  
  // Se for string, retorna diretamente após validação
  if (typeof foto === 'string') {
    const trimmed = foto.trim();
    if (trimmed === '') return null;
    return trimmed;
  }
  
  // Se for objeto com propriedade url
  if (typeof foto === 'object' && foto !== null && 'url' in foto) {
    const url = (foto as { url: unknown }).url;
    if (typeof url === 'string') {
      const trimmed = url.trim();
      if (trimmed === '') return null;
      return trimmed;
    }
  }
  
  return null;
}

/**
 * Valida se uma URL de imagem é válida para uso no componente Image do Next.js
 * @param url - URL ou string a ser validada
 * @returns true se a URL é válida, false caso contrário
 */
export function isValidImageUrl(url: unknown): url is string {
  const fotoUrl = getFotoUrl(url);
  if (!fotoUrl) return false;
  
  // Verifica se é uma URL válida (http/https) ou blob URL
  return fotoUrl.startsWith('http://') || 
         fotoUrl.startsWith('https://') || 
         fotoUrl.startsWith('blob:') ||
         fotoUrl.startsWith('/');
}

