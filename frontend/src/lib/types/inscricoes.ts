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
  valor: number; // valor final, já com desconto
  criadaEm: string; // ISO
  /** Código legível mostrado no recibo (ex.: "SITC26-0042"). */
  codigo?: string;
  loteId?: string;
  loteNome?: string;
  valorBruto?: number; // preço do lote antes do cupom
  cupom?: CupomAplicado;
  metodoPagamento?: MetodoPagamento;
  atividadesIds?: string[];
  pagaEm?: string; // ISO — preenchido quando o pagamento é confirmado (RF04.6)
}

/** Forma de pagamento escolhida no checkout. "gratuito" quando o total é zero. */
export type MetodoPagamento = "pix" | "cartao" | "boleto" | "gratuito";

/** Cupom de desconto de uma edição (RF04.3). */
export interface CupomDesconto {
  codigo: string;
  eventoSlug: string;
  tipo: "percentual" | "valor_fixo";
  valor: number; // % (0–100) ou R$, conforme o tipo
  validoAte?: string; // ISO
  usosRestantes: number;
}

/** Cupom validado e o desconto que ele gera sobre um lote. */
export interface CupomAplicado {
  codigo: string;
  tipo: CupomDesconto["tipo"];
  valor: number;
  desconto: number; // R$ efetivamente abatidos
}

/** Payload do passo de pagamento (RF04.2–4, RF04.9). */
export interface NovaInscricao {
  eventoSlug: string;
  loteId: string;
  atividadesIds: string[];
  cupom?: string;
  metodoPagamento: MetodoPagamento;
  /** Token de uso único emitido ao abrir o checkout (anti-bot, RF04.9). */
  tokenCheckout: string;
  participante?: string;
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
