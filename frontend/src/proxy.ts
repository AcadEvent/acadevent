import { NextResponse, type NextRequest } from "next/server";

/**
 * Guarda de rotas RBAC (RF02.1.2 / RNF03.2).
 *
 * Convenção Next 16: este arquivo é o antigo `middleware` (renomeado para
 * `proxy`). As áreas /painel, /gerenciar e /admin exigem autenticação. A
 * verificação real depende do contrato de auth com o backend, que ainda não
 * existe — por isso o guard está DESLIGADO por padrão (`AUTH_ENABLED`),
 * permitindo que o time visualize os stubs durante o desenvolvimento.
 *
 * TODO(auth): ao integrar a sessão (src/lib/auth/session.ts), ligar AUTH_ENABLED
 * e checar o token/perfil (redirecionar para /login quando ausente/insuficiente).
 */

const AUTH_ENABLED = false;

const PROTECTED_PREFIXES = ["/painel", "/gerenciar", "/admin"];

export function proxy(request: NextRequest) {
  if (!AUTH_ENABLED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // TODO(auth): validar sessão real. Sem sessão → redireciona ao login.
  const hasSession = request.cookies.has("acadevent_session");
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/gerenciar/:path*", "/admin/:path*"],
};
