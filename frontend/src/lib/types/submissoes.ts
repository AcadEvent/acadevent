/**
 * Domínio: Submissões e avaliações.
 * Referência: backend/prisma/schema.prisma (models Submissao, Avaliacao...).
 * Ver docs/arquitetura-frontend.md §4.
 */

/** Parecer de submissão (RF06.3). */
export type ParecerSubmissao = "aceito" | "rejeitado" | "revisao";
