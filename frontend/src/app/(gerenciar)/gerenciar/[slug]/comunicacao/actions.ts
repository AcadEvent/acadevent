"use server";

/**
 * Server Action de envio de comunicado (RF09.2/3). Endpoint protegido por JWT +
 * RBAC (organizador/admin): lemos o token httpOnly e reenviamos como Bearer.
 * Sem sessão de organizador o backend responde 401/403.
 */
import { revalidatePath } from "next/cache";

import { enviarComunicado } from "@/lib/api";
import { ErroRequisicao } from "@/lib/api/_client";
import { getToken } from "@/lib/auth/session";

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

export async function enviarComunicadoAction(
  slug: string,
  input: {
    idEdicao: number;
    titulo: string;
    conteudo: string;
    perfilAlvo?: string;
  },
): Promise<ResultadoAcao> {
  const token = await getToken();
  if (!token) {
    return { ok: false, erro: "Faça login como organizador para continuar." };
  }
  try {
    await enviarComunicado(token, input);
    revalidatePath(`/gerenciar/${slug}/comunicacao`);
    return { ok: true };
  } catch (e) {
    const erro =
      e instanceof ErroRequisicao ? e.message : "Falha ao enviar comunicado.";
    return { ok: false, erro };
  }
}
