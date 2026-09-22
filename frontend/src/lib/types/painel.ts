/**
 * Domínio: Painel do usuário (hub pessoal e visão por evento).
 * Referência de campos: backend/prisma/schema.prisma (models Notificacao,
 * InscricaoEdicao, Edicao, Atividade). Ver docs/arquitetura-frontend.md §4.
 */
import type { PerfilUsuario } from "./comum";

/**
 * Situação da inscrição do usuário em um evento (InscricaoEdicao.status).
 * Diferente de StatusInscricao (eventos.ts), que diz se o evento está aceitando
 * inscrições do público em geral.
 */
export type StatusMinhaInscricao = "confirmada" | "pendente" | "cancelada";

/** Atividade da grade pessoal (RF03.1.6). O local vem da reserva de espaço. */
export interface AtividadeInscrita {
  id: string;
  titulo: string;
  inicio: string; // ISO
  fim: string; // ISO
  local?: string;
}

/** Visão geral de um evento no painel pessoal (RF03.1.1). */
export interface PainelEvento {
  slug: string;
  nome: string;
  sigla?: string;
  edicao?: string;
  descricao?: string;
  inicio: string; // ISO
  fim: string; // ISO
  local?: string;
  statusInscricao: StatusMinhaInscricao;
  /** Papéis exercidos neste evento (RF02.2). O usuário pode acumular. */
  papeis: PerfilUsuario[];
  /** Atividades em que estou inscrito neste evento (RF03.1.6). */
  atividadesInscritas: number;
  /** Certificados já liberados para download (RF03.1.4). */
  certificadosDisponiveis: number;
  /** Recibos de pagamento disponíveis (RF03.1.3). */
  recibosDisponiveis: number;
  /** Trabalhos que enviei a este evento (RF03.1.7). */
  submissoesEnviadas: number;
  /** Minha grade neste evento, em ordem cronológica (RF03.1.6). */
  atividades: AtividadeInscrita[];
}

/**
 * Aviso recebido pelo usuário (RF03.1.5). O model Notificacao não tem vínculo
 * com evento nem marcação de leitura no schema.
 */
export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  data: string; // ISO
}
