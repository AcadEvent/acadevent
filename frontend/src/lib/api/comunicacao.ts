/**
 * Domínio: Comunicação & Notificações (RF09 / RF03) — acesso a dados.
 * Consome a API real da issue #88. Sem mock/`fake()`.
 *
 * - Enviar comunicado e listar "minhas notificações" exigem sessão (Bearer).
 * - Listar comunicados de uma edição é público (GET /comunicacao/edicao/:id).
 * Ver docs/arquitetura-frontend.md §4.
 */
import type { Comunicado, Notificacao } from "@/lib/types";

import { API_URL, requestAutenticado } from "./_client";

interface ComunicadoApi {
  id_comunicado: number;
  titulo: string;
  conteudo: string;
  perfil_alvo?: string | null;
  id_atividade?: number | null;
  data_envio?: string | null;
}

interface NotificacaoApi {
  id_notificacao: number;
  titulo: string;
  mensagem: string;
  data?: string | null;
}

function toComunicado(c: ComunicadoApi): Comunicado {
  return {
    id: c.id_comunicado,
    titulo: c.titulo,
    conteudo: c.conteudo,
    perfilAlvo: c.perfil_alvo ?? undefined,
    idAtividade: c.id_atividade ?? undefined,
    enviadoEm: c.data_envio ?? undefined,
  };
}

function toNotificacao(n: NotificacaoApi): Notificacao {
  return {
    id: String(n.id_notificacao),
    titulo: n.titulo,
    mensagem: n.mensagem,
    data: n.data ?? "",
  };
}

/** Comunicados de uma edição, mais recentes primeiro (RF09) — público. */
export async function getComunicadosDaEdicao(
  idEdicao: number,
): Promise<Comunicado[]> {
  const res = await fetch(`${API_URL}/comunicacao/edicao/${idEdicao}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Não foi possível carregar os comunicados.");
  const dados = (await res.json()) as ComunicadoApi[];
  return dados.map(toComunicado);
}

/** Envia um comunicado geral ou segmentado por perfil (RF09.2/3 — organizador). */
export async function enviarComunicado(
  token: string,
  input: {
    idEdicao: number;
    titulo: string;
    conteudo: string;
    perfilAlvo?: string;
    idAtividade?: number;
  },
): Promise<Comunicado> {
  const c = await requestAutenticado<ComunicadoApi>(
    "/comunicacao/enviar",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        id_edicao: input.idEdicao,
        titulo: input.titulo,
        conteudo: input.conteudo,
        perfil_alvo: input.perfilAlvo,
        id_atividade: input.idAtividade,
      }),
    },
  );
  return toComunicado(c);
}

/** Notificações do usuário autenticado (RF03.1.5 / RF09.4). */
export async function getMinhasNotificacoes(
  token: string,
): Promise<Notificacao[]> {
  const dados = await requestAutenticado<NotificacaoApi[]>(
    "/comunicacao/minhas-notificacoes",
    token,
  );
  return dados.map(toNotificacao);
}
