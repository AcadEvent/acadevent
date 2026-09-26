/**
 * Domínio: Eventos — acesso a dados.
 * Ver docs/arquitetura-frontend.md §4. Não importar de src/lib/mock nas páginas.
 *
 * Leituras públicas (getEventos/getEvento/getEventosPublicados) já consomem a API
 * real (GET /eventos, GET /eventos/:slug). As demais funções (autenticadas ou
 * sub-recursos) seguem em mock até o contrato de sessão (#74) e as issues #90–#93.
 */
import type {
  Atividade,
  Evento,
  Ministrante,
  StatusEvento,
} from "@/lib/types";
import type { DashboardEvento } from "@/lib/types";
import {
  mockAtividades,
  mockEventos,
  mockMeusEventosSlugs,
  mockMinistrantes,
} from "@/lib/mock/eventos";
import { mockDashboardIndicadores } from "@/lib/mock/eventos";
import { API_URL, fake } from "./_client";

/**
 * Forma crua devolvida hoje pelo backend: o `Edicao` do Prisma (snake_case) com o
 * `slug` anexado. TODO(#74): remover este mapper quando o backend passar a
 * devolver o `Evento` (camelCase) do contrato — aí as leituras só fazem `fetch`.
 */
interface EdicaoApi {
  slug: string;
  titulo_oficial?: string | null;
  sigla?: string | null;
  numero_edicao?: string | null;
  descricao_geral?: string | null;
  area_tematica?: string | null;
  unidade_promotora?: string | null;
  endereco?: string | null;
  url_logotipo?: string | null;
  status_evento?: string | null;
  data_abertura_evento?: string | null;
  data_encerramento_evento?: string | null;
  capacidade_max_participantes?: number | null;
}

const STATUS_MAP: Record<string, StatusEvento> = {
  rascunho: "rascunho",
  ativo: "publicado",
  publicado: "publicado",
  em_andamento: "em_andamento",
  "em andamento": "em_andamento",
  encerrado: "encerrado",
  arquivado: "arquivado",
};

function normalizarStatus(valor?: string | null): StatusEvento {
  return STATUS_MAP[(valor ?? "").trim().toLowerCase()] ?? "publicado";
}

function edicaoToEvento(e: EdicaoApi): Evento {
  return {
    slug: e.slug,
    nome: e.titulo_oficial ?? "",
    sigla: e.sigla ?? undefined,
    edicao: e.numero_edicao ?? undefined,
    descricao: e.descricao_geral ?? undefined,
    areaTematica: e.area_tematica ?? undefined,
    instituicao: e.unidade_promotora ?? undefined,
    local: e.endereco ?? undefined,
    logoUrl: e.url_logotipo ?? undefined,
    status: normalizarStatus(e.status_evento),
    // TODO(#74): o backend ainda não envia o status de inscrição. A lista pública
    // só traz eventos visíveis, então assumimos "abertas" até o contrato definir.
    inscricao: "abertas",
    inicio: e.data_abertura_evento ?? "",
    fim: e.data_encerramento_evento ?? "",
    capacidade: e.capacidade_max_participantes ?? undefined,
  };
}

export async function getEventos(): Promise<Evento[]> {
  const res = await fetch(`${API_URL}/eventos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar os eventos.");
  const dados = (await res.json()) as EdicaoApi[];
  return dados.map(edicaoToEvento);
}

export function getEventosOrganizador(): Promise<Evento[]> {
  return fake(mockEventos);
}

/** Eventos dos quais o participante autenticado faz parte (RF03.1.1). */
export function getMeusEventos(): Promise<Evento[]> {
  return fake(
    mockEventos.filter((evento) => mockMeusEventosSlugs.includes(evento.slug)),
  );
}

export async function getEvento(slug: string): Promise<Evento | null> {
  const res = await fetch(`${API_URL}/eventos/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Não foi possível carregar o evento.");
  return edicaoToEvento((await res.json()) as EdicaoApi);
}

export function getEventosPublicados(): Promise<Evento[]> {
  // GET /eventos já devolve apenas eventos publicados/ativos (listarPublicos).
  return getEventos();
}

export function getAtividades(_eventoSlug: string): Promise<Atividade[]> {
  return fake(mockAtividades);
}

export function getMinistrantes(_eventoSlug: string): Promise<Ministrante[]> {
  return fake(mockMinistrantes);
}

export function postEvento(
  input: Omit<Evento, "slug" | "status" | "inscricao">,
): Promise<Evento> {
  const baseSlug = [input.sigla || input.nome, input.edicao]
    .filter(Boolean)
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug = baseSlug || "evento";
  let sufixo = 2;

  while (mockEventos.some((evento) => evento.slug === slug)) {
    slug = `${baseSlug || "evento"}-${sufixo}`;
    sufixo += 1;
  }

  const evento: Evento = {
    ...input,
    slug,
    status: "rascunho",
    inscricao: "em_breve",
  };

  mockEventos.push(evento);
  return fake(evento);
}

/** Visão consolidada da edição para o organizador (RF03.2.1). */
export function getDashboard(slug: string): Promise<DashboardEvento | null> {
  const evento = mockEventos.find((item) => item.slug === slug);
  const indicadores = mockDashboardIndicadores[slug];

  if (!evento || !indicadores) {
    return fake(null);
  }

  return fake({
    evento: {
      slug: evento.slug,
      nome: evento.nome,
      sigla: evento.sigla,
      edicao: evento.edicao,
      status: evento.status,
      inicio: evento.inicio,
      fim: evento.fim,
      capacidade: evento.capacidade,
    },
    ...indicadores,
  });
}
