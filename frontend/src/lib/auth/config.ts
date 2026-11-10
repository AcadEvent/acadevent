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
 * Com `true`, as áreas /painel, /gerenciar e /admin exigem sessão (cookie do
 * login real → /auth/me); o RBAC por perfil é feito nos layouts de cada área e,
 * por recurso, no backend (RolesGuard). Para depurar telas sem backend, é
 * possível desligar via `AUTH_ENABLED=false` no ambiente do frontend.
 */
export const AUTH_ENABLED = process.env.AUTH_ENABLED !== "false";
