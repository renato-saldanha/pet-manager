import { api } from "./api";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_URL_BACKEND;

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export const AuthService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>("/autenticacao/login", { username, password });
        const { access_token, refresh_token } = response.data;
        if (access_token) {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            console.log("[AUTH_SERVICE] Tokens salvos com sucesso");
        } else {
            console.error("[AUTH_SERVICE] Token não encontrado na resposta da API!");
        }
        return response.data;
    },

    refresh_token: async (): Promise<string | null> => {
        const refresh_token = localStorage.getItem("refresh_token");
        if (!refresh_token) return null;

        try {
            // Usar axios diretamente para evitar interceptors
            // IMPORTANTE: Refresh token deve ser enviado no header Authorization, não no body
            const response = await axios.put<{ token?: string; access_token?: string }>(
                `${baseURL}/autenticacao/refresh`,
                {}, // Body vazio - refresh token vai no header
                {
                    headers: {
                        'Authorization': `Bearer ${refresh_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            // A API pode retornar 'token' ou 'access_token'
            const newToken = response.data.token || response.data.access_token;
            if (newToken) {
                localStorage.setItem("access_token", newToken);
                return newToken;
            } else {
                throw new Error("Token not found in response");
            }
        } catch (error) {
            AuthService.logout();
            return null;
        }
    },

    logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
    },

    getToken: () => localStorage.getItem("access_token"),
    isAuthenticated: () => !!localStorage.getItem("access_token")
};
