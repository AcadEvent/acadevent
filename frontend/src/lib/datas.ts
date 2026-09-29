/**
 * Formatação de datas/horas para a UI (pt-BR).
 *
 * Formatamos em UTC de propósito: o backend guarda o horário pretendido como
 * "…Z" (wall-clock salvo como UTC). Converter para o fuso do servidor
 * deslocaria o horário (bug clássico, cf. #43). Ecoar em UTC preserva o valor
 * cadastrado (ex.: "08:30Z" → "08:30").
 */

export function formatDiaLongo(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatHora(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Intervalo de horas "08:30 – 12:30"; omite o fim se ausente. */
export function formatIntervaloHora(inicio: string, fim: string): string {
  const i = formatHora(inicio);
  const f = formatHora(fim);
  if (i && f) return `${i} – ${f}`;
  return i || f;
}

/** Chave de dia (YYYY-MM-DD, UTC) para agrupar/ordenar. */
export function chaveDia(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}
