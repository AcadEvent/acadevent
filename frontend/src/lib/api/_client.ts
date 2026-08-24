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
