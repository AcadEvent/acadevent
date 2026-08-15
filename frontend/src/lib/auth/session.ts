import type { PerfilUsuario } from "@/lib/types";

/**
 * Stub de sessão/autenticação (RF02.1 / RNF03).
 *
 * A autenticação real (e-mail+senha, hash bcrypt, tokens) vive no backend NestJS
 * (RNF03.1); o frontend apenas lê a sessão e aplica RBAC na UI. Enquanto o
 * contrato de auth não existe, `getSession()` retorna null.
 *
 * TODO(auth): ler o token de sessão (cookie httpOnly) e resolver o usuário via
 * API. Alimentar o guard de rotas em src/middleware.ts.
 */

export interface Session {
  userId: string;
  nome: string;
  perfis: PerfilUsuario[];
}

export async function getSession(): Promise<Session | null> {
  // TODO(auth): substituir por leitura real do cookie + validação na API.
  return null;
}

/** True se a sessão possui ao menos um dos perfis exigidos (RBAC, RF02.1.2). */
export function hasRole(
  session: Session | null,
  perfis: PerfilUsuario[],
): boolean {
  if (!session) return false;
  return session.perfis.some((p) => perfis.includes(p));
}
