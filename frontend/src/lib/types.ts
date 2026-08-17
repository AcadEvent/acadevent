/**
 * Tipos de domínio consumidos pela UI do AcadEvent.
 *
 * Fonte: Documento de Requisitos v2.0 (RF01–RF16) + backend/prisma/schema.prisma.
 * O frontend é uma View pura que consome REST/JSON (RNF07.2); estes tipos
 * representam o formato esperado da API e serão alinhados ao contrato final.
 * Mantê-los mínimos: só os campos que a interface exibe.
 */

/** Perfis de acesso (RF02, RBAC). */
export type PerfilUsuario =
  | "visitante"
  | "participante"
  | "ministrante"
  | "patrocinador"
  | "comissao"
  | "organizador"
  | "parecerista"
  | "admin";

/** Status do evento (RF01.3.3). */
export type StatusEvento =
  | "rascunho"
  | "publicado"
  | "em_andamento"
  | "encerrado"
  | "arquivado";

/** Status de pagamento de uma inscrição (RF04.4). */
export type StatusPagamento =
  | "pendente"
  | "confirmado"
  | "cancelado"
  | "estornado";

/** Situação de inscrição pública do evento (RF01.5.3). */
export type StatusInscricao = "abertas" | "encerradas" | "esgotadas" | "em_breve";

/** Parecer de submissão (RF06.3). */
export type ParecerSubmissao = "aceito" | "rejeitado" | "revisao";

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

export interface InscricaoEdicao {
  id: string;
  eventoSlug: string;
  participante: string;
  statusPagamento: StatusPagamento;
  valor: number;
  criadaEm: string; // ISO
}
