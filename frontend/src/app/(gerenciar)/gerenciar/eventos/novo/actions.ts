"use server";

/**
 * Criação de evento (RF01.1). POST /eventos é autenticado: lemos o JWT do cookie
 * httpOnly e reenviamos como Bearer (o form é client component e não acessa o
 * cookie). O backend gera o slug e torna o usuário atual organizador da edição.
 *
 * Mapeia a forma do formulário para o CriarEventoDto (snake_case). O DTO de
 * criação NÃO aceita logo/banner/público-alvo — esses campos são ignorados aqui.
 */
import { API_URL } from "@/lib/api/_client";
import { getToken } from "@/lib/auth/session";

export interface NovoEventoInput {
  nome: string;
  sigla?: string;
  edicao?: string;
  instituicao?: string;
  descricao?: string;
  areaTematica?: string;
  local?: string;
  capacidade?: number;
  /** ISO local, sem conversão para UTC (ver issue #43.3). */
  inicio: string;
  fim: string;
}

export type ResultadoCriarEvento =
  | { ok: true; slug: string }
  | { ok: false; erro: string };

async function mensagemDoErro(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    const m = body?.message;
    if (Array.isArray(m)) return m.join(" ");
    if (typeof m === "string") return m;
  } catch {
    // corpo não-JSON
  }
  if (res.status === 401) return "Sua sessão expirou. Entre novamente.";
  if (res.status === 403) return "Você não tem permissão para criar eventos.";
  return "Não foi possível criar o evento. Revise os dados e tente novamente.";
}

export async function criarEventoAction(
  input: NovoEventoInput,
): Promise<ResultadoCriarEvento> {
  const token = await getToken();
  if (!token) {
    return { ok: false, erro: "Sua sessão expirou. Entre novamente." };
  }

  const tituloOficial =
    [input.nome, input.edicao].filter(Boolean).join(" ").trim() ||
    input.nome.trim();

  const body: Record<string, unknown> = {
    nome_marca: input.nome.trim(),
    titulo_oficial: tituloOficial,
    unidade_promotora: (input.instituicao ?? "").trim(),
    data_abertura_evento: input.inicio,
    data_encerramento_evento: input.fim,
  };
  if (input.edicao) body.numero_edicao = input.edicao;
  if (input.sigla) body.sigla = input.sigla;
  if (input.areaTematica) body.area_tematica = input.areaTematica;
  if (input.descricao) body.descricao_geral = input.descricao;
  if (typeof input.capacidade === "number") {
    body.capacidade_max_participantes = input.capacidade;
  }
  if (input.local) body.endereco = input.local;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/eventos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, erro: "Servidor indisponível. Tente novamente." };
  }

  if (!res.ok) {
    return { ok: false, erro: await mensagemDoErro(res) };
  }

  const data = (await res.json()) as {
    edicao?: { slug?: string };
    slug?: string;
  };
  const slug = data.edicao?.slug ?? data.slug;
  if (!slug) {
    return {
      ok: false,
      erro: "Evento criado, mas o servidor não retornou o identificador.",
    };
  }
  return { ok: true, slug };
}
