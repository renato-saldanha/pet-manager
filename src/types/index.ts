export interface FotoDto {
    id: number;
    nome: string;
    contentType: string;
    url: string;
}

export interface Pet {
    id: number;
    nome: string;
    idade: number;
    raca: string;
    foto?: string | FotoDto;
    tutores?: Tutor[];
}

export interface Tutor {
    id: number;
    nome: string;
    telefone: string;
    endereco: string;
    email?: string;
    cpf?: string;
    foto?: string | FotoDto; // Pode ser URL (string) ou objeto FotoDto com url
    pets?: Pet[];
}

export interface Pageable<T> {
    content: T[];
    totalElements?: number; // Pode ser totalElements ou total
    total?: number; // API pode retornar 'total' em vez de 'totalElements'
    totalPages?: number; // Pode ser totalPages ou pageCount
    pageCount?: number; // API pode retornar 'pageCount' em vez de 'totalPages'
    size: number;
    number?: number; // Pode ser number ou page
    page?: number; // API pode retornar 'page' em vez de 'number'
}
