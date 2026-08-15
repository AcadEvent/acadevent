# AcadEvent — Frontend

Camada de apresentação do AcadEvent: **Next.js 16 (App Router) + React 19 +
TypeScript + Material UI (MUI)**. Consome a API REST do backend NestJS (não acessa
banco). Roda na porta **3001**.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3001
npm run build    # build de produção (type-check incluso)
npm run lint
```

Variáveis de ambiente: `NEXT_PUBLIC_API_URL` (padrão `http://localhost:3000`).

## Onde está a minha página?

A estrutura de pastas em `src/app` espelha a URL, agrupada por área de acesso
(`(public)`, `(auth)`, `(painel)`, `(gerenciar)`, `(admin)`). Cada rota já existe
como `page.tsx` com um **brief** no topo (o que fazer, componentes, dados, DoD).
Abra o arquivo da sua rota e substitua o `<PagePlaceholder />` pelo conteúdo real.

Veja quem é dono do quê em [`docs/atribuicoes.md`](./docs/atribuicoes.md).

## Documentação

- [`docs/arquitetura-frontend.md`](./docs/arquitetura-frontend.md) — como o projeto é organizado.
- [`docs/decisoes-de-design.md`](./docs/decisoes-de-design.md) — stack e **convenções de implementação (MUI)**.
- [`docs/mapa-de-paginas.md`](./docs/mapa-de-paginas.md) — todas as rotas × requisitos.
- [`docs/atribuicoes.md`](./docs/atribuicoes.md) — divisão de trabalho e template de brief.

## Regras rápidas

- Estilo **só** via tema MUI + `sx` (sem Tailwind, sem cor hardcoded).
- Dados **sempre** via `@/lib/api` (nunca `fetch` direto).
- Links via `href` (o `next/link` está integrado ao tema).
- Páginas `/` (landing) e `/eventos` são os **exemplos de referência**.
