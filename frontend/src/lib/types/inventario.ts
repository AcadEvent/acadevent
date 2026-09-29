/**
 * Domínio: Inventário físico (RF08).
 * Referência: backend/prisma/schema.prisma (model ItemInventarioFisico).
 * Ver docs/arquitetura-frontend.md §4.
 */

/** Item de inventário de uma edição (RF08.1). Alerta quando disponível ≤ mínima. */
export interface ItemInventario {
  id: string;
  eventoSlug: string;
  nome: string; // tipo_item
  descricao?: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  quantidadeMinima: number;
}
