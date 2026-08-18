/**
 * Domínio: Inscrições e pagamentos.
 * Referência: backend/prisma/schema.prisma (models InscricaoEdicao, Pagamento...).
 * Ver docs/arquitetura-frontend.md §4.
 */

/** Status de pagamento de uma inscrição (RF04.4). */
export type StatusPagamento =
  | "pendente"
  | "confirmado"
  | "cancelado"
  | "estornado";

export interface InscricaoEdicao {
  id: string;
  eventoSlug: string;
  participante: string;
  statusPagamento: StatusPagamento;
  valor: number;
  criadaEm: string; // ISO
}
