import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_URL_BACKEND;

// Log apenas em desenvolvimento para debug
if (process.env.NODE_ENV === 'development') {
  console.log('[API] Base URL:', baseURL || 'NÃO DEFINIDA');
}

if (!baseURL) {
  console.error(
    '[API] ERRO: NEXT_PUBLIC_URL_BACKEND não está definida. ' +
    'Verifique o arquivo .env e reinicie o servidor.'
  );
}

export const api = axios.create({
  baseURL: baseURL || '',
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Não tentar refresh em requisições de login ou refresh (evita loop infinito)
    if (originalRequest.url?.includes("/login") || originalRequest.url?.includes("/refresh")) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh_token = localStorage.getItem("refresh_token");
        if (refresh_token) {
          // Fazer requisição de refresh sem interceptar (usando axios diretamente)
          // IMPORTANTE: Refresh token deve ser enviado no header Authorization, não no body
          const { data } = await axios.put(
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
          const newAccessToken = data.token || data.access_token;
          if (newAccessToken) {
            localStorage.setItem("access_token", newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            throw new Error("Token not found in response");
          }
        } else {
          throw new Error("No refresh token");
        }
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
