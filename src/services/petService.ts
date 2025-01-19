import { api } from "./api";
import { Pet, Pageable } from "../types";

export const PetService = {
    getAll: async (page: number = 0, size: number = 10, nome?: string): Promise<Pageable<Pet>> => {
        const params: any = { page, size };
        if (nome) params.nome = nome;
        const response = await api.get<Pageable<Pet>>("/v1/pets", { params });
        return response.data;
    },

    getById: async (id: number): Promise<Pet> => {
        const response = await api.get<Pet>(`/v1/pets/${id}`);
        return response.data;
    },

    create: async (pet: Omit<Pet, 'id'>): Promise<Pet> => {
        const response = await api.post<Pet>("/v1/pets", pet);
        return response.data;
    },

    update: async (id: number, pet: Partial<Pet>): Promise<Pet> => {
        const response = await api.put<Pet>(`/v1/pets/${id}`, pet);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/v1/pets/${id}`);
    },

    uploadPhoto: async (id: number, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append("foto", file); // Campo 'foto' conforme documentação Swagger
        await api.post(`/v1/pets/${id}/fotos`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
};
