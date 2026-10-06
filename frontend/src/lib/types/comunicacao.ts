/**
 * Domínio: Comunicação, Notificações, Materiais e Logs (RF03/RF09/RF10/RF16).
 * Referência: backend/prisma/schema.prisma (Comunicado, Notificacao) e as
 * respostas de /comunicacao, /admin/logs e /storage. Ver docs/arquitetura §4.
 */

/** Comunicado enviado numa edição (RF09). */
export interface Comunicado {
  id: number;
  titulo: string;
  conteudo: string;
  perfilAlvo?: string;
  idAtividade?: number;
  enviadoEm?: string; // ISO
}

// A `Notificacao` da UI já existe em ./painel.ts (RF03.1.5) — reutilizada aqui.

/** Linha de log de auditoria (RF16.3) — já sanitizada pelo backend. */
export interface RegistroLog {
  metodo: string;
  url: string;
  statusCode: number;
  duracaoMs: number;
  data: string; // ISO
  usuarioId?: number;
}

/** Arquivo persistido pelo storage (RF10 / RNF05.4). */
export interface ArquivoSalvo {
  nomeOriginal: string;
  nomeArmazenado: string;
  caminhoRelativo: string;
  url: string;
  tamanho?: number;
}
