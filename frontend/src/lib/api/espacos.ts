/**
 * Domínio: Espaços físicos e reservas (RF07) — acesso a dados (mock por enquanto).
 * TODO(#92): trocar por fetch (POST /espacos, GET /espacos/edicao/:id,
 * POST /espacos/reservar, GET /espacos/mapa-ocupacao/edicao/:id) ao ligar ao Nest.
 * Ver docs/arquitetura-frontend.md §4.
 */
import type { Espaco, Reserva } from "@/lib/types";
import { mockEspacos, mockReservas } from "@/lib/mock/espacos";
import { fake } from "./_client";

/** Espaços cadastrados na edição (RF07.1). */
export function getEspacos(eventoSlug: string): Promise<Espaco[]> {
  return fake(mockEspacos.filter((e) => e.eventoSlug === eventoSlug));
}

/** Cadastra um espaço (RF07.1). */
export function criarEspaco(input: Omit<Espaco, "id">): Promise<Espaco> {
  const espaco: Espaco = { ...input, id: `esp-${crypto.randomUUID().slice(0, 8)}` };
  mockEspacos.push(espaco);
  return fake(espaco);
}

/** Reservas dos espaços da edição, em ordem cronológica (RF07.2). */
export function getReservas(eventoSlug: string): Promise<Reserva[]> {
  const ids = new Set(
    mockEspacos.filter((e) => e.eventoSlug === eventoSlug).map((e) => e.id),
  );
  return fake(
    mockReservas
      .filter((r) => ids.has(r.espacoId))
      .sort((a, b) => a.inicio.localeCompare(b.inicio)),
  );
}

/** Há sobreposição com outra reserva do mesmo espaço? (RF07 — conflito). */
function haConflito(espacoId: string, inicio: string, fim: string): boolean {
  const ini = new Date(inicio).getTime();
  const f = new Date(fim).getTime();
  return mockReservas.some(
    (r) =>
      r.espacoId === espacoId &&
      new Date(r.inicio).getTime() < f &&
      ini < new Date(r.fim).getTime(),
  );
}

export type ResultadoReserva =
  | { ok: true; reserva: Reserva }
  | { ok: false; erro: string };

/** Cria uma reserva rejeitando conflito de horário no mesmo espaço (RF07.2). */
export function criarReserva(
  input: Omit<Reserva, "id">,
): Promise<ResultadoReserva> {
  if (new Date(input.fim) <= new Date(input.inicio)) {
    return fake({ ok: false, erro: "O término deve ser depois do início." });
  }
  if (haConflito(input.espacoId, input.inicio, input.fim)) {
    return fake({
      ok: false,
      erro: "Conflito de horário: o espaço já está reservado nesse período.",
    });
  }
  const reserva: Reserva = {
    ...input,
    id: `res-${crypto.randomUUID().slice(0, 8)}`,
  };
  mockReservas.push(reserva);
  return fake({ ok: true, reserva });
}
