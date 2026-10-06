import { cookies } from "next/headers";

import type { PerfilUsuario } from "@/lib/types";
import { meRequest } from "@/lib/api";

import { COOKIE_SESSAO } from "./config";

/**
 * Sessão do usuário resolvida no servidor (RF02.1 / RNF03.1).
 *
 * O JWT do backend vive num cookie httpOnly (`acadevent_session`, gravado pelos
 * Server Actions em ./actions.ts). Aqui lemos o cookie e resolvemos o usuário via
 * `GET /auth/me` (Bearer). O middleware (src/middleware.ts) faz o gate barato
 * (cookie presente?); esta função faz a resolução completa para a UI/RBAC.
 */
export interface Session {
  userId: string;
  nome: string;
  email: string;
  perfis: PerfilUsuario[];
}

/**
 * JWT bruto da sessão (cookie httpOnly) para reenviar como `Authorization: Bearer`
 * em chamadas autenticadas server-side. Null se não há sessão.
 */
export async function getToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE_SESSAO)?.value ?? null;
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;

  try {
    const u = await meRequest(token);
    return { userId: u.id, nome: u.nome, email: u.email, perfis: u.perfis };
  } catch {
    // Token ausente/expirado/inválido → tratado como não autenticado.
    return null;
  }
}

/**
 * Normaliza um perfil para comparação: minúsculas e `administrador` → `admin`.
 * O backend devolve os perfis por extenso e em formas que divergem do tipo
 * `PerfilUsuario` da UI (ex.: "administrador"); normalizar evita falso-negativo.
 */
function normalizarPerfil(p: string): string {
  const v = p.toLowerCase();
  return v === "administrador" ? "admin" : v;
}

/** True se a sessão possui ao menos um dos perfis exigidos (RBAC, RF02.1.2). */
export function hasRole(
  session: Session | null,
  perfis: PerfilUsuario[],
): boolean {
  if (!session) return false;
  const meus = new Set(session.perfis.map(normalizarPerfil));
  return perfis.some((p) => meus.has(normalizarPerfil(p)));
}
