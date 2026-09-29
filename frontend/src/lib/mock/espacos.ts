import type { Espaco, Reserva } from "@/lib/types";

/**
 * Dados de exemplo de espaços e reservas. NÃO importar nas páginas — use src/lib/api.
 */

export const mockEspacos: Espaco[] = [
  {
    id: "esp-1",
    eventoSlug: "sitc-2026",
    nome: "Auditório A",
    tipo: "Auditório",
    capacidade: 200,
    local: "Bloco Central, térreo",
    recursos: "Projetor, som, ar-condicionado",
  },
  {
    id: "esp-2",
    eventoSlug: "sitc-2026",
    nome: "Laboratório 2",
    tipo: "Laboratório",
    capacidade: 40,
    local: "Bloco de Computação, 1º andar",
    recursos: "30 computadores, projetor",
  },
];

export const mockReservas: Reserva[] = [
  {
    id: "res-1",
    espacoId: "esp-1",
    titulo: "Abertura oficial",
    inicio: "2026-10-14T09:00:00-03:00",
    fim: "2026-10-14T10:30:00-03:00",
  },
  {
    id: "res-2",
    espacoId: "esp-2",
    titulo: "Minicurso: contêineres",
    inicio: "2026-10-14T14:00:00-03:00",
    fim: "2026-10-14T17:00:00-03:00",
  },
];
