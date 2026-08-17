import type { Atividade, Evento, Ministrante } from "@/lib/types";
import {
  mockAtividades,
  mockEventos,
  mockMinistrantes,
} from "@/lib/mock/eventos";

/**
 * Camada de acesso a dados — o único ponto que conhece a origem dos dados.
 *
 * O frontend é uma View pura que consome a API REST do backend (RNF07.2). Hoje
 * estas funções retornam mock; quando a API NestJS existir, troca-se o corpo
 * por `fetch(`${API_URL}/...`)` SEM alterar as páginas que as consomem.
 *
 * REGRA: páginas e componentes importam SEMPRE daqui — nunca chamam `fetch`
 * direto nem importam de src/lib/mock.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Simula latência de rede para exercitar estados de loading nas páginas.
function fake<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

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
