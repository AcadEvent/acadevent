"use server";

/**
 * Criação de lote de ingresso (RF04.2, organizador). POST /inscricoes/lotes é
 * autenticado e exige perfil de gestão: lemos o JWT do cookie e resolvemos a
 * edição pelo slug (o backend chaveia por id_edicao).
 */
import { criarLote, getEvento, type NovoLote } from "@/lib/api";
import { ErroRequisicao } from "@/lib/api/_client";
import { getToken } from "@/lib/auth/session";
import type { LoteIngresso } from "@/lib/types";

export type ResultadoLote =
  | { ok: true; lote: LoteIngresso }
  | { ok: false; erro: string };

export async function criarLoteAction(
  slug: string,
  input: NovoLote,
): Promise<ResultadoLote> {
  const token = await getToken();
  if (!token) {
    return { ok: false, erro: "Sua sessão expirou. Entre novamente." };
  }
  const evento = await getEvento(slug);
  if (!evento?.idEdicao) {
    return { ok: false, erro: "Evento não encontrado." };
  }
  try {
    const lote = await criarLote(token, evento.idEdicao, input);
    return { ok: true, lote };
  } catch (e) {
    const erro =
      e instanceof ErroRequisicao ? e.message : "Não foi possível criar o lote.";
    return { ok: false, erro };
  }
}
