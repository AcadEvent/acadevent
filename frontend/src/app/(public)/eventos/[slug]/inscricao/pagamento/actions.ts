"use server";

import { criarInscricao, type ResultadoInscricao } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import type { NovaInscricao } from "@/lib/types";

/**
 * Finaliza o checkout no servidor (RF04.2–4, RF04.9). Roda como Server Action
 * para que a revalidação do lote, do cupom e do token de uso único aconteça fora
 * do navegador — e para que a inscrição fique no mesmo processo que a página de
 * confirmação lê. Os dados continuam passando só por src/lib/api.
 *
 * `honeypot` é um campo invisível do formulário: gente não preenche, robô sim.
 */
export async function finalizarInscricao(
  input: Omit<NovaInscricao, "participante">,
  honeypot: string,
): Promise<ResultadoInscricao> {
  if (honeypot) {
    return { ok: false, erro: "Não foi possível concluir a inscrição." };
  }

  const sessao = await getSession();
  return criarInscricao({ ...input, participante: sessao?.nome });
}
