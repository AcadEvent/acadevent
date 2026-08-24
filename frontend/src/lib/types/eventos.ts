/**
 * Domínio: Eventos (evento, atividades, ministrantes, patrocinadores, materiais).
 * Referência: backend/prisma/schema.prisma (models Evento, Edicao, Atividade...).
 * Ver docs/arquitetura-frontend.md §4.
 */

/** Status do evento (RF01.3.3). */
export type StatusEvento =
  | "rascunho"
  | "publicado"
  | "em_andamento"
  | "encerrado"
  | "arquivado";

/** Situação de inscrição pública do evento (RF01.5.3). */
export type StatusInscricao = "abertas" | "encerradas" | "esgotadas" | "em_breve";

/** Tipos de atividade (RF05.1). */
export type TipoAtividade =
  | "palestra"
  | "minicurso"
  | "mesa_redonda"
  | "workshop"
  | "mostra"
  | "maratona"
  | "outro";

export interface Ministrante {
  id: string;
  nome: string;
  bio?: string;
  instituicao?: string;
  areaAtuacao?: string;
  fotoUrl?: string;
}

export interface Patrocinador {
  id: string;
  razaoSocial: string;
  logoUrl?: string;
  nivel: string;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: TipoAtividade;
  inicio: string; // ISO
  fim: string; // ISO
  cargaHoraria?: number;
  local?: string;
  capacidade?: number;
  vagasRestantes?: number;
  ministrantesIds?: string[];
}

/** Evento na visão da UI (achata Evento+Edicao dos requisitos). */
export interface Evento {
  slug: string;
  nome: string;
  sigla?: string;
  edicao?: string;
  descricao?: string;
  areaTematica?: string;
  instituicao?: string;
  local?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: StatusEvento;
  inscricao: StatusInscricao;
  inicio: string; // ISO
  fim: string; // ISO
  aberturaInscricoes?: string; // ISO — para contagem regressiva (RF01.2.5)
  capacidade?: number;
}
