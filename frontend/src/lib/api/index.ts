/**
 * Camada de acesso a dados — o único ponto que conhece a origem dos dados.
 * Import estável para páginas e componentes: `@/lib/api`.
 *
 * O frontend é uma View pura que consome a API REST do backend (RNF07.2). A
 * implementação é dividida por domínio (eventos.ts, inscricoes.ts, ...) para
 * reduzir colisões de merge no trabalho em paralelo: cada pessoa edita/adiciona o
 * SEU módulo de domínio. Para um domínio novo, crie `./<dominio>.ts` e exporte-o
 * aqui. Ver docs/arquitetura-frontend.md §4.
 *
 * REGRA: páginas e componentes importam SEMPRE daqui — nunca chamam `fetch`
 * direto nem importam de src/lib/mock.
 */
export { API_URL } from "./_client";
export * from "./eventos";
export * from "./auth";
