"use server";

import { revalidatePath } from "next/cache";

import { confirmarPagamento } from "@/lib/api";
import type { InscricaoEdicao } from "@/lib/types";

/**
 * Confirma o pagamento no servidor, no mesmo processo que a lista e o relatório
 * leem. Revalida as duas rotas para o subtítulo e os KPIs acompanharem.
 */
export async function confirmarPagamentoAction(
  id: string,
): Promise<InscricaoEdicao> {
  const atualizada = await confirmarPagamento(id);
  revalidatePath(`/gerenciar/${atualizada.eventoSlug}/inscricoes`);
  revalidatePath(`/gerenciar/${atualizada.eventoSlug}/pagamentos`);
  return atualizada;
}
