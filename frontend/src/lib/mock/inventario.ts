import type { ItemInventario } from "@/lib/types";

/** Dados de exemplo de inventário. NÃO importar nas páginas — use src/lib/api. */
export const mockItensInventario: ItemInventario[] = [
  {
    id: "item-1",
    eventoSlug: "sitc-2026",
    nome: "Kits de credenciamento",
    descricao: "Crachá + cordão + sacola",
    quantidadeTotal: 500,
    quantidadeDisponivel: 500,
    quantidadeMinima: 50,
  },
  {
    id: "item-2",
    eventoSlug: "sitc-2026",
    nome: "Cabos HDMI",
    descricao: "Para os projetores das salas",
    quantidadeTotal: 20,
    quantidadeDisponivel: 8, // abaixo do mínimo → alerta
    quantidadeMinima: 10,
  },
  {
    id: "item-3",
    eventoSlug: "sitc-2026",
    nome: "Garrafas de água",
    quantidadeTotal: 300,
    quantidadeDisponivel: 120,
    quantidadeMinima: 30,
  },
];
