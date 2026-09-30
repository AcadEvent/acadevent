/**
 * Domínio: Atividades & Certificados (RF05 / RF11) — tipos da UI.
 * Referência: backend/prisma/schema.prisma (Atividade, Certificado) e as respostas
 * de GET /atividades/cronograma/edicao/:id e GET /certificados/:codigo/validar.
 * Ver docs/arquitetura-frontend.md §4. O tipo `Atividade` vive em ./eventos.ts.
 */

/** Certificado autenticado devolvido por GET /certificados/:codigo/validar (RF11.7). */
export interface CertificadoValidado {
  codigo: string;
  nomeParticipante: string;
  /** E-mail já mascarado pelo backend (ex.: "j***@dominio.com"). */
  emailMascarado?: string;
  evento: string;
  sigla?: string;
  atividade?: string;
  cargaHoraria?: number;
  emitidoEm?: string; // ISO
}

/** Resultado da validação pública de um certificado. */
export type ResultadoValidacaoCertificado =
  | { valido: true; certificado: CertificadoValidado }
  | { valido: false };
