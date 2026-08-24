import type { LoteIngresso } from "@/lib/types";

/**
 * Dados de exemplo servidos por trás de src/lib/api enquanto a API NestJS não
 * existe. NÃO importar diretamente nas páginas — use as funções de src/lib/api.
 *
 * Os slugs acompanham os de mock/eventos.ts para exercitar os estados do fluxo
 * de inscrição: lote vigente (sitc-2026), lote ainda por abrir (enebio-2026) e
 * lote encerrado (jornada-eng-2025).
 */

export const mockLotes: LoteIngresso[] = [
  {
    id: "l1",
    eventoSlug: "sitc-2026",
    nome: "1º lote — antecipado",
    preco: 60,
    abertura: "2026-08-01T09:00:00-03:00",
    encerramento: "2026-09-15T23:59:00-03:00",
    vagas: 200,
    vagasRestantes: 84,
  },
  {
    id: "l2",
    eventoSlug: "sitc-2026",
    nome: "2º lote — regular",
    preco: 90,
    abertura: "2026-09-16T09:00:00-03:00",
    encerramento: "2026-10-10T23:59:00-03:00",
    vagas: 250,
    vagasRestantes: 250,
  },
  {
    id: "l3",
    eventoSlug: "enebio-2026",
    nome: "Lote único",
    preco: 45,
    abertura: "2026-09-10T09:00:00-03:00",
    encerramento: "2026-11-01T23:59:00-03:00",
    vagas: 300,
    vagasRestantes: 300,
  },
  {
    id: "l4",
    eventoSlug: "jornada-eng-2025",
    nome: "Lote único",
    preco: 0,
    abertura: "2025-08-01T09:00:00-03:00",
    encerramento: "2025-09-20T23:59:00-03:00",
    vagas: 250,
    vagasRestantes: 0,
  },
];
