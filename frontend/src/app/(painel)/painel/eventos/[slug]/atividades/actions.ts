"use server";

import { revalidatePath } from "next/cache";

import { ErroApi, inscreverAtividade } from "@/lib/api";
import { getToken } from "@/lib/auth/session";

export type ResultadoInscricaoAtividade =
  | { ok: true }
  | { ok: false; erro: string };

/**
 * Inscreve o participante autenticado em uma atividade do evento (RF05.3,
 * RF05.4). O backend valida inscrição confirmada no evento, duplicidade,
 * conflito de horário e lotação; a mensagem de recusa volta para a tela.
 */
export async function inscreverNaAtividade(
  slug: string,
  idAtividade: string,
): Promise<ResultadoInscricaoAtividade> {
  const token = await getToken();
  if (!token) {
    return { ok: false, erro: "Sua sessão expirou. Entre novamente." };
  }

  try {
    await inscreverAtividade(token, Number(idAtividade));
  } catch (e) {
    if (e instanceof ErroApi) {
      return {
        ok: false,
        erro:
          e.status === 403
            ? "Sua inscrição no evento ainda não está confirmada. Conclua o pagamento para escolher atividades."
            : e.message,
      };
    }
    return {
      ok: false,
      erro: "Não foi possível concluir a inscrição nesta atividade.",
    };
  }

  revalidatePath(`/painel/eventos/${slug}`);
  revalidatePath(`/painel/eventos/${slug}/atividades`);
  return { ok: true };
}
