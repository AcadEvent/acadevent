import { NextResponse, type NextRequest } from "next/server";

/**
 * Guarda de rotas RBAC (RF02.1.2 / RNF03.2).
 *
 * DEVE se chamar `src/middleware.ts` e exportar `middleware`: é o único nome que o
 * Next.js registra de fato como middleware (confirmado pelo middleware-manifest).
 * O antigo `src/proxy.ts` NÃO era invocado — o guard ficava morto (issue #41).
 *
 * As áreas /painel, /gerenciar e /admin exigem autenticação. A verificação real
 * depende do contrato de auth (#74) com o backend, que ainda não existe — por isso
 * o guard está DESLIGADO por padrão (`AUTH_ENABLED`), permitindo que o time
 * visualize os stubs durante o desenvolvimento. Agora que o arquivo é invocado,
 * basta ligar AUTH_ENABLED quando a sessão real existir.
 *
 * TODO(auth): ao integrar a sessão (src/lib/auth/session.ts), ligar AUTH_ENABLED
 * e checar o token/perfil (redirecionar para /login quando ausente/insuficiente).
 */

const AUTH_ENABLED = false;

const PROTECTED_PREFIXES = ["/painel", "/gerenciar", "/admin"];

export function middleware(request: NextRequest) {
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
