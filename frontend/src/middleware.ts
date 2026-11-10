import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ENABLED, COOKIE_SESSAO } from "@/lib/auth/config";

/**
 * Guarda de rotas RBAC (RF02.1.2 / RNF03.2).
 *
 * DEVE se chamar `src/middleware.ts` e exportar `middleware`: é o único nome que o
 * Next.js registra de fato como middleware (confirmado pelo middleware-manifest).
 * O antigo `src/proxy.ts` NÃO era invocado — o guard ficava morto (issue #41).
 *
 * As áreas /painel, /gerenciar e /admin exigem autenticação. O guard vem LIGADO
 * por padrão (`AUTH_ENABLED`, desligável só com AUTH_ENABLED=false). Aqui é o gate
 * barato (cookie presente?); a validação do token e o RBAC por perfil acontecem
 * nos layouts (getSession → /auth/me) e no backend (JwtAuthGuard/RolesGuard).
 */

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

  // Sem cookie de sessão → redireciona ao login.
  const hasSession = request.cookies.has(COOKIE_SESSAO);
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
