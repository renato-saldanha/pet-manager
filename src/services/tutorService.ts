import { api } from "./api";
import { Tutor, Pageable } from "../types";

export const TutorService = {
    getAll: async (page: number = 0, size: number = 10, nome?: string): Promise<Pageable<Tutor>> => {
        const params: any = { page, size };
        if (nome) params.nome = nome;
        const response = await api.get<Pageable<Tutor>>("/v1/tutores", {
            params
        });
        return response.data;
    },

    getById: async (id: number): Promise<Tutor> => {
        const response = await api.get<Tutor>(`/v1/tutores/${id}`);
        return response.data;
    },

    create: async (tutor: Omit<Tutor, 'id'>): Promise<Tutor> => {
        const response = await api.post<Tutor>("/v1/tutores", tutor);
        return response.data;
    },

    update: async (id: number, tutor: Partial<Tutor>): Promise<Tutor> => {
        const response = await api.put<Tutor>(`/v1/tutores/${id}`, tutor);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/v1/tutores/${id}`);
    },

    uploadPhoto: async (id: number, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append("foto", file); // Campo 'foto' conforme documentação Swagger
        await api.post(`/v1/tutores/${id}/fotos`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    linkPet: async (tutorId: number, petId: number): Promise<void> => {
        await api.post(`/v1/tutores/${tutorId}/pets/${petId}`);
    },

    unlinkPet: async (tutorId: number, petId: number): Promise<void> => {
        await api.delete(`/v1/tutores/${tutorId}/pets/${petId}`);
    }
};
