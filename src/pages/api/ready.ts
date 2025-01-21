import type { NextApiRequest, NextApiResponse } from 'next';

interface ReadyResponse {
  status: 'ready' | 'not-ready';
  timestamp: string;
  checks: {
    application: 'ok' | 'error';
    environment: 'ok' | 'error';
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadyResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  // Verificar se as variáveis de ambiente críticas estão configuradas
  const backendURL = process.env.NEXT_PUBLIC_URL_BACKEND;
  const envCheck = backendURL ? 'ok' : 'error';

  // Verificar se a aplicação está rodando (processo ativo)
  const appCheck = process.uptime() > 0 ? 'ok' : 'error';

  const allChecksOk = envCheck === 'ok' && appCheck === 'ok';
  const status: 'ready' | 'not-ready' = allChecksOk ? 'ready' : 'not-ready';

  const response: ReadyResponse = {
    status,
    timestamp: new Date().toISOString(),
    checks: {
      application: appCheck,
      environment: envCheck,
    },
  };

  const statusCode = status === 'ready' ? 200 : 503;
  return res.status(statusCode).json(response);
}
