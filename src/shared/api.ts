const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Todas as chamadas do frontend passam pelo API Gateway, que encaminha para o BFF. */
export async function api<T>(caminho: string, opcoes: { method?: string; body?: unknown } = {}): Promise<T> {
  const resp = await fetch(`${BASE_URL}${caminho}`, {
    method: opcoes.method ?? 'GET',
    headers: opcoes.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });
  const texto = await resp.text();
  const corpo = texto ? JSON.parse(texto) : null;
  if (!resp.ok) throw new ApiError(resp.status, corpo?.erro ?? `Erro ${resp.status}`);
  return corpo as T;
}

export const apiBaseUrl = BASE_URL;
