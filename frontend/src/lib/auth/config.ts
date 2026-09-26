/**
 * Config de autenticação compartilhada. Mantido separado (sem imports server-only)
 * para poder ser importado tanto pelo middleware (edge) quanto por Server
 * Components/Actions.
 */

/** Cookie httpOnly onde o JWT do backend é guardado (contrato #74). */
export const COOKIE_SESSAO = "acadevent_session";

/**
 * Liga o guard de rotas (src/middleware.ts) e o gate do fluxo de inscrição.
 *
 * O fluxo de auth já está integrado (login → cookie httpOnly → /auth/me), mas
 * mantemos DESLIGADO até o backend estar no ar com o banco migrado (#79): com
 * `true`, as áreas /painel, /gerenciar e /admin exigem sessão, e sem backend
 * ninguém consegue logar — o time ficaria trancado fora dos stubs. Virar para
 * `true` (uma linha) é o que fecha o mecanismo do #41 quando a infra estiver
 * pronta. `getSession`/login/logout já funcionam independentemente deste flag.
 */
export const AUTH_ENABLED = false;
