"use server";

import { revalidatePath } from "next/cache";

import { confirmarPagamento } from "@/lib/api";
import { getToken } from "@/lib/auth/session";

/**
 * Confirma o pagamento de uma inscrição no backend (RF04.5) e revalida a lista
 * e o relatório financeiro para o subtítulo e os KPIs acompanharem. Erros do
 * backend (ex.: "ja se encontra confirmada") sobem com a mensagem original.
 */
export async function confirmarPagamentoAction(
  id: string,
  eventoSlug: string,
): Promise<void> {
  const token = await getToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  await confirmarPagamento(token, id);
  revalidatePath(`/gerenciar/${eventoSlug}/inscricoes`);
  revalidatePath(`/gerenciar/${eventoSlug}/pagamentos`);
}
