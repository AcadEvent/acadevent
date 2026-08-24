# Arquitetura do Frontend — AcadEvent

Versão: 1.1
Data: 2026-08-12 (rev. 2026-08-18)
Autor: Guilherme Zanan Piveta (SFE)
Revisores: —

---

Documento-âncora da base (esqueleto) do frontend. Descreve as decisões estruturais
implementadas para que o time (e agentes de IA) construam as páginas de forma
consistente, sem reabrir discussões. Rastreável ao [Documento de Requisitos v2.0](./acad_event_requirements.md)
e ao [Documento de Arquitetura do Sistema](./system_architecture.md).

Formatação segue o [padrão de documentação](../../docs/padrao-de-documentacao.md).
Decisões visuais em [decisoes-de-design.md](./decisoes-de-design.md); rotas em
[mapa-de-paginas.md](./mapa-de-paginas.md); divisão de trabalho em
[atribuicoes.md](./atribuicoes.md).

---

## 1. Papel na arquitetura do sistema

O AcadEvent segue **MVC Distribuído em 3 camadas**. O frontend é a **camada de
apresentação (View)**: renderiza a interface e **consome exclusivamente a API REST
do backend NestJS** em JSON (RNF07.2). **Não acessa banco de dados** nem contém
regra de negócio — validação, RBAC efetivo, cálculos e persistência ficam no
backend. Porta de execução: **3001** (RNF07.1).

## 2. Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| UI / tema | Material UI (MUI) v9 + Emotion |
| Ícones | `@mui/icons-material` |
| Datas | `@mui/x-date-pickers` (+ `dayjs`) |
| Formulários | MUI (campos) + `react-hook-form` + `zod` |
| PWA | `manifest.ts` nativo do App Router |

**MUI-only:** o Tailwind do scaffold inicial foi removido para não haver dois
sistemas de estilo concorrentes. Todo estilo vem do tema MUI e da prop `sx`.

## 3. Estrutura de pastas

```
src/
  app/
    layout.tsx                 # raiz: <html>, fontes, <ThemeRegistry>
    globals.css                # reset mínimo (baseline é do <CssBaseline>)
    manifest.ts                # PWA (RNF04.2)
    not-found.tsx / error.tsx / loading.tsx
    (public)/                  # área pública + landing + inscrição
    (auth)/                    # login, cadastro, recuperação
    (painel)/                  # painel do usuário (autenticado)
    (gerenciar)/               # gestão do evento (organizador/comissão)
    (admin)/                   # administração da plataforma
  theme/
    theme.ts                   # createTheme (tokens, tipografia, LinkBehavior)
    ThemeRegistry.tsx          # AppRouterCacheProvider + ThemeProvider + CssBaseline
  components/
    LinkBehavior.tsx           # ponte MUI <-> next/link
    ui/                        # PagePlaceholder, EmptyState
    layout/                    # Header, Footer, Sidebar, DashboardShell, PageHeader, Section
    domain/                    # EventCard (+ EventListItem, EventFilters… a criar)
  lib/
    types/                     # tipos de domínio (index barrel + 1 arquivo por domínio)
    api/                       # acesso a dados (index barrel + 1 arquivo por domínio)
    mock/                      # dados de exemplo (por trás de api/, 1 arquivo por domínio)
    auth/                      # stub de sessão + RBAC (session.ts)
  proxy.ts                     # guarda de rotas RBAC (antigo "middleware")
```

**Route groups** (`(nome)`) agrupam por área de acesso **sem afetar a URL**. A
landing vive em `(public)/page.tsx` para herdar o cabeçalho/rodapé públicos.

## 4. Camada de dados e tipos

`src/lib/api/` é o **único ponto que conhece a origem dos dados**. Hoje as funções
(`getEventos`, `getEvento`, …) retornam mock de `src/lib/mock/`; quando a API NestJS
existir, troca-se o corpo por `fetch(\`${API_URL}/...\`)` **sem alterar as páginas**.

**Regra:** páginas e componentes importam **sempre** de `@/lib/api` e `@/lib/types`
— nunca chamam `fetch` direto nem importam de `@/lib/mock`. A URL da API vem de
`NEXT_PUBLIC_API_URL`.

### Divisão por domínio (evita colisões de merge)

`types/`, `api/` e `mock/` são **divididos por domínio** (`eventos`, `inscricoes`,
`submissoes`, …), cada um atrás de um **barrel** `index.ts`. Os caminhos de import
(`@/lib/api`, `@/lib/types`) **não mudam** — o barrel re-exporta tudo. Motivo: com
várias pessoas trabalhando em paralelo por vários dias (ver
[atribuicoes.md](./atribuicoes.md)), um único arquivo compartilhado vira fonte
constante de conflito. Assim, cada pessoa **edita/adiciona o seu arquivo de
domínio**; para um domínio novo, cria `types/<dominio>.ts` (e `api/<dominio>.ts`,
`mock/<dominio>.ts`) e o exporta no barrel correspondente.

**Tipos são escritos à mão, não gerados.** Use `backend/prisma/schema.prisma` como
**referência** de quais campos existem (para não inventar/divergir), mas o tipo do
front pode **achatar e renomear** para a forma que a UI precisa (ex.: `Evento`
funde `Evento`+`Edicao`; usa `slug` em vez de `id`). Mantenha-os mínimos — só o que
a interface exibe — e adicione campos específicos do front quando fizer sentido.

**Regra de merge:** ao terminar (fim do ciclo de build), antes de mandar para
revisão, rode `git fetch && git rebase origin/dev` — quem escreveu a mudança
resolve os próprios conflitos, em vez de passá-los ao time de aprovação.

## 5. Autenticação e RBAC

Áreas `/painel`, `/gerenciar` e `/admin` são protegidas (RF02.1.2 / RNF03.2). O
guard vive em `src/proxy.ts` (convenção Next 16, ex-`middleware`) e o stub de
sessão em `src/lib/auth/session.ts`. Enquanto o contrato de auth com o backend não
existe, o guard fica **desligado** (`AUTH_ENABLED = false`) para permitir visualizar
os stubs. A autenticação real (e-mail+senha, bcrypt, tokens) é do backend; o
frontend apenas lê a sessão e aplica RBAC na navegação.

## 6. Tema e estilo

`src/theme/theme.ts` centraliza cores, tipografia (mantém **Geist**), `shape` e a
integração de navegação (`LinkBehavior`, para usar `next/link` via `href`). A cor
`primary` é um **placeholder** até a identidade visual/logo (RF01.1.4); ao fechar a
marca, troca-se apenas `primary.main`. **Modo escuro** fica para fase posterior.
Convenções detalhadas de uso em [decisoes-de-design.md](./decisoes-de-design.md).

## 7. Padrão de página e stubs

Cada rota do [mapa-de-paginas.md](./mapa-de-paginas.md) já existe como um `page.tsx`
com um **brief estruturado** no topo (rota, dono, RF, propósito, componentes, dados,
estados, DoD) e renderiza `<PagePlaceholder />`. O dono abre o arquivo, lê o brief e
substitui o placeholder pelo conteúdo real. As páginas `/` (landing) e `/eventos`
são **exemplos de referência já implementados** — imite o padrão delas.

## 8. Como rodar

```bash
npm install
npm run dev     # http://localhost:3001
npm run build   # produção (type-check + lint incluídos no fluxo)
npm run lint
```

## 9. Próximos passos (transversais)

- Fechar a cor de marca e ícones do PWA quando houver logo (RF01.1.4).
- Integrar o contrato de auth e ligar `AUTH_ENABLED` no `proxy.ts`.
- Trocar o corpo de `src/lib/api` de mock para `fetch` real.
- Service worker/offline e notificações push (RF09.5), se necessário.
