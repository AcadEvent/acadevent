/**
 * Barrel dos tipos de domínio da UI (import estável: `@/lib/types`).
 *
 * Os tipos são divididos por domínio para reduzir colisões de merge quando várias
 * pessoas trabalham em paralelo: cada uma edita/adiciona o SEU arquivo de domínio.
 * Para um domínio novo, crie `./<dominio>.ts` e exporte-o aqui. Referência de
 * campos: backend/prisma/schema.prisma. Ver docs/arquitetura-frontend.md §4.
 */
export * from "./comum";
export * from "./eventos";
export * from "./inscricoes";
export * from "./submissoes";
