/**
 * Infra interna da camada de dados. NÃO importar nas páginas — use os módulos de
 * domínio via barrel `@/lib/api`.
 *
 * Hoje `fake` apenas resolve o mock; quando a API NestJS existir, troca-se por
 * `fetch(`${API_URL}/...`)` aqui e nos módulos de domínio, sem tocar nas páginas.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Simula latência de rede para exercitar estados de loading nas páginas. */
export function fake<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

/** Erro de requisição que preserva o status HTTP (413, 403, 409, ...). */
export class ErroRequisicao extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErroRequisicao";
  }
}

/** Extrai a mensagem de erro do corpo JSON do NestJS (string ou string[]). */
async function mensagemDoErro(res: Response): Promise<string | undefined> {
  return res
    .json()
    .then((b: { message?: string | string[] }) =>
      Array.isArray(b?.message) ? b.message.join(" ") : b?.message,
    )
    .catch(() => undefined);
}

/**
 * Requisição JSON autenticada (Bearer). Server-side apenas — o token vem do
 * cookie httpOnly da sessão (auth/session.getToken). Lança ErroRequisicao com o
 * status HTTP em falha, repassando a mensagem do backend.
 */
export async function requestAutenticado<T>(
  caminho: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const msg = await mensagemDoErro(res);
    throw new ErroRequisicao(msg ?? "Falha na requisição.", res.status);
  }
  return (await res.json()) as T;
}

export { mensagemDoErro };
