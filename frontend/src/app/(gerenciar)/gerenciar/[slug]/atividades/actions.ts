"use server";

/**
 * Server Actions da gestão de atividades (RF05.1 / RF05.4).
 *
 * Endpoints protegidos por JWT + RBAC (organizador/admin) no backend. Lemos o
 * token httpOnly da sessão e o reenviamos como Bearer. Sem sessão de organizador
 * o backend responde 401/403 — devolvido como mensagem amigável.
 */
import { revalidatePath } from "next/cache";

import {
  associarMinistrante,
  criarAtividade,
  ErroApi,
} from "@/lib/api";
import { getToken } from "@/lib/auth/session";

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

function mensagemErro(e: unknown, padrao: string): string {
  if (e instanceof ErroApi) return e.message;
  return padrao;
}

export async function criarAtividadeAction(
  slug: string,
  input: {
    idEdicao: number;
    titulo: string;
    tipoAtividade?: string;
    descricao?: string;
    cargaHoraria: number;
    inicio?: string;
    fim?: string;
  },
): Promise<ResultadoAcao> {
  const token = await getToken();
  if (!token) {
    return { ok: false, erro: "Faça login como organizador para continuar." };
  }
  try {
    await criarAtividade(token, input);
    revalidatePath(`/gerenciar/${slug}/atividades`);
    revalidatePath(`/eventos/${slug}/cronograma`);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: mensagemErro(e, "Falha ao criar atividade.") };
  }
}

export async function associarMinistranteAction(
  slug: string,
  idAtividade: number,
  idMinistrante: number,
): Promise<ResultadoAcao> {
  const token = await getToken();
  if (!token) {
    return { ok: false, erro: "Faça login como organizador para continuar." };
  }
  try {
    await associarMinistrante(token, idAtividade, idMinistrante);
    revalidatePath(`/gerenciar/${slug}/atividades`);
    revalidatePath(`/eventos/${slug}/cronograma`);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: mensagemErro(e, "Falha ao associar ministrante.") };
  }
}
