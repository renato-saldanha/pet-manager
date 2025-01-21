import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  backend?: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const startTime = Date.now();
  const uptime = process.uptime();
  const baseURL = process.env.NEXT_PUBLIC_URL_BACKEND;

  // Verificar conectividade com backend
  let backendStatus: 'connected' | 'disconnected' = 'disconnected';
  let responseTime: number | undefined;

  if (baseURL) {
    try {
      const backendStartTime = Date.now();
      // Tentar fazer uma requisição simples ao backend (health check ou endpoint raiz)
      await axios.get(`${baseURL}/autenticacao/login`, {
        timeout: 5000,
        validateStatus: () => true, // Aceitar qualquer status code
      });
      responseTime = Date.now() - backendStartTime;
      backendStatus = 'connected';
    } catch (error) {
      // Backend não está acessível
      backendStatus = 'disconnected';
    }
  }

  const overallStatus: 'healthy' | 'unhealthy' = backendStatus === 'connected' ? 'healthy' : 'unhealthy';

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    backend: {
      status: backendStatus,
      ...(responseTime && { responseTime }),
    },
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  return res.status(statusCode).json(response);
}
