/**
 * Tipos transversais (usados por mais de um domínio) da UI do AcadEvent.
 *
 * Referência de domínio: backend/prisma/schema.prisma (ver docs/arquitetura-frontend.md §4).
 * Tipos são escritos à mão e mínimos — só o que a interface exibe. Campos
 * específicos do front (ex.: slug) são permitidos quando a UI precisar; não é
 * obrigatório espelhar o schema 1:1.
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
