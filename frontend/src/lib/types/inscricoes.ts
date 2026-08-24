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

/** Vínculo do participante com a instituição (usado no passo 1 da inscrição). */
export type CategoriaParticipante =
  | "estudante"
  | "docente"
  | "profissional"
  | "outro";

/** Lote de ingressos de uma edição (RF04.2). */
export interface LoteIngresso {
  id: string;
  eventoSlug: string;
  nome: string;
  preco: number; // 0 = gratuito
  abertura?: string; // ISO
  encerramento?: string; // ISO
  vagas: number;
  vagasRestantes?: number;
}

/** Dados coletados no passo 1 do fluxo de inscrição (RF01.5.3, RNF04.4). */
export interface DadosParticipante {
  nomeCompleto: string;
  email: string;
  instituicao?: string;
  categoria: CategoriaParticipante;
}
