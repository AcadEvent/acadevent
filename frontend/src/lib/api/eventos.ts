/**
 * Domínio: Eventos — acesso a dados (mock por enquanto).
 * Ver docs/arquitetura-frontend.md §4. Não importar de src/lib/mock nas páginas.
 */
import type { Atividade, Evento, Ministrante } from "@/lib/types";
import {
  mockAtividades,
  mockEventos,
  mockMinistrantes,
} from "@/lib/mock/eventos";
import { fake } from "./_client";

export function getEventos(): Promise<Evento[]> {
  return fake(mockEventos);
}

export function getEvento(slug: string): Promise<Evento | null> {
  return fake(mockEventos.find((e) => e.slug === slug) ?? null);
}

export function getEventosPublicados(): Promise<Evento[]> {
  return fake(mockEventos.filter((e) => e.status === "publicado"));
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
