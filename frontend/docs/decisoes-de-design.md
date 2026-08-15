# Decisões de Design — Frontend AcadEvent

Versão: 0.4
Data: 2026-08-12
Autor: João Vitor Antunes da Silva (SPM), Guilherme Zanan Piveta (SFE)
Revisores: —

---

Documento vivo das decisões visuais e de componentes do frontend. Objetivo: permitir implementação consistente sem reabrir discussões já fechadas.

Padrão de autoria e revisão: [docs/padrao-de-documentacao.md](../../docs/padrao-de-documentacao.md).

---

> **Atualização v0.4 (2026-08-12):** o esqueleto do frontend foi implementado
> (ver [arquitetura-frontend.md](./arquitetura-frontend.md)). Esta versão fecha as
> decisões abaixo e adiciona as **Convenções de implementação (MUI)** (§7).
> Decisões fechadas: MUI **decidido** (não mais proposta); **Tailwind removido**
> (MUI-only); fonte **Geist** mantida; **modo escuro adiado**; cor `primary` como
> **placeholder** até o logo; navegação via `next/link` (`LinkBehavior` no tema).

## Decisão de stack UI: Material UI (MUI)

**Status:** Decidido e implementado (v0.4).  
**Autor** Guilherme Zanan Piveta (SFE)
**Data:** 2026-06-18 (implementado em 2026-08-12).

Adotar [Material UI (MUI)](https://mui.com/material-ui/) como biblioteca de componentes e sistema de tema do frontend. Pacotes: `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material` e `@mui/x-date-pickers`.

**O que essa decisão resolve diretamente:** abordagem de componentes, ícones, datas/calendário, escala de espaçamento, breakpoints, border radius, sombras, tokens de cor, escala tipográfica e a biblioteca base de componentes (Fases 1 e 2) — ver linhas marcadas como **Decidido (MUI)** abaixo.

**O que MUI _não_ decide (continua pendente):**

- Valor da cor primária da marca (MUI calcula hover/active/contraste a partir dela, mas a cor em si é escolha do time).
- Se haverá modo escuro na Fase 1 (MUI suporta nativamente; a decisão de _quando_ é nossa).
- Manter Geist ou usar Roboto (padrão MUI) como fonte.
- Estado e validação de formulário (MUI fornece os campos; lógica fica com react-hook-form + zod).
- Páginas, jornadas e componentes de domínio (§3 e §4.3).
- Nível-alvo de acessibilidade, validador de contraste e governança (§5 e §6).

**Notas de mapeamento:**

- `Badge` (rótulo de status, ex.: `EnrollmentStatusBadge`) → usar **`Chip`** do MUI. O `Badge` do MUI é o indicador de contador/notificação.
- `Section` e `PageHeader` não têm componente próprio no MUI — compor com `Box`/`Stack`/`Typography`.

---

## 1. Stack e arquitetura UI

### Stack atual

| Tecnologia | Versão / nota |
| --- | --- |
| Next.js | App Router |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | v4 |
| Estilos globais | `src/app/globals.css` |

### Decisões de biblioteca

| Decisão | Escolha | Status | Data | Notas |
| --- | --- | --- | --- | --- |
| Abordagem de componentes | Material UI (`@mui/material`) | Decidido (MUI) | 2026-06-18 | Componentes estilizados (Material Design); tema via `@emotion`. |
| Primitivos headless | Não aplicável | Decidido (MUI) | 2026-06-18 | MUI é estilizado, não headless; dispensa lib headless separada. Se necessário, usar Base UI. |
| Ícones | `@mui/icons-material` | Decidido (MUI) | 2026-06-18 | |
| Formulários | MUI (campos) + react-hook-form + zod | Parcial | 2026-06-18 | MUI fornece os campos; estado/validação ficam com react-hook-form + zod. |
| Datas / calendário | `@mui/x-date-pickers` | Decidido (MUI) | 2026-06-18 | DatePicker / DateRangePicker. |

### Critérios de reuso vs criação

- **Reutilizar:** comportamento e acessibilidade já resolvidos; customização principalmente visual.
- **Criar localmente:** componentes de domínio (eventos, inscrição, status).
- **Evitar:** customizações profundas em libs de terceiros que aumentem custo de manutenção.

---

## 2. Identidade visual (Fase 1)

### 2.1 Cores

Tokens mapeados para a paleta do tema MUI. Os valores derivam do tema; a cor de marca ainda não está fechada, mas será extraída das cores do ícone/logo (MUI calcula as variações automaticamente a partir dela).

| Token | Mapeamento MUI | Uso | Status |
| --- | --- | --- | --- |
| `primary` | `palette.primary.main` | Ações principais, links de destaque | Pendente — derivada das cores do ícone |
| `primary-hover` | `palette.primary.dark` / overlay de hover | Hover em botões e links primários | Decidido (MUI) |
| `background` | `palette.background.default` | Fundo da aplicação | Decidido (MUI) |
| `foreground` | `palette.text.primary` | Texto principal | Decidido (MUI) |
| `muted` | `palette.text.secondary` | Texto secundário, placeholders | Decidido (MUI) |
| `success` | `palette.success.main` | Confirmações, estados positivos | Decidido (MUI) |
| `warning` | `palette.warning.main` | Alertas não críticos | Decidido (MUI) |
| `error` | `palette.error.main` | Erros, ações destrutivas | Decidido (MUI) |
| `info` | `palette.info.main` | Informações neutras | Decidido (MUI) |

**Perguntas em aberto**

- [ ] Cor primária da marca: valor exato a definir a partir das cores do ícone/logo (MUI deriva hover/active/contraste a partir dela).
- [ ] Contraste mínimo: WCAG AA? (MUI calcula `contrastText`; padrão já mira AA, mas o alvo é decisão do time.)
- [ ] Modo escuro na Fase 1 ou fase posterior? (MUI suporta via `palette.mode`; decidir _quando_.)

### 2.2 Tipografia

| Papel | Família | Tamanho / peso | Status |
| --- | --- | --- | --- |
| Display / H1 | Herda do tema | Padrão MUI (variante `h1`) | Decidido (padrão MUI) |
| Heading / H2–H3 | Herda do tema | Padrão MUI (variantes `h2`/`h3`) | Decidido (padrão MUI) |
| Body | Herda do tema | Padrão MUI (variante `body1`) | Decidido (padrão MUI) |
| Caption / legenda | Herda do tema | Padrão MUI (variante `caption`) | Decidido (padrão MUI) |

**Perguntas em aberto**

- [ ] Manter Geist (já configurada no layout) ou usar Roboto (padrão MUI)? (só a família fica em aberto; a escala segue o padrão MUI)
- [x] Escala tipográfica: padrão MUI (fixa, em `rem`); fluida só se houver necessidade.

### 2.3 Espaçamento, grid e forma

| Aspecto | Decisão | Status |
| --- | --- | --- |
| Escala de espaçamento | Padrão MUI (`theme.spacing`, base 8px) | Decidido (padrão MUI) |
| Largura máxima de conteúdo | Padrão MUI (`Container`, `maxWidth`) | Decidido (padrão MUI) |
| Breakpoints | Padrão MUI (`xs`/`sm`/`md`/`lg`/`xl`) | Decidido (padrão MUI) |
| Border radius | Padrão MUI (`shape.borderRadius`, 4px) | Decidido (padrão MUI) |
| Sombras | Padrão MUI (`theme.shadows`) | Decidido (padrão MUI) |
| Densidade visual | Padrão MUI (densidade padrão dos componentes) | Decidido (padrão MUI) |

---

## 3. Páginas e jornadas (Fase 1)

### Páginas prioritárias do MVP

| Página / rota | Prioridade | Layout | Componentes necessários | Status |
| --- | --- | --- | --- | --- |
| _Ex.: Home_ | _A definir_ | _A definir_ | _A definir_ | Pendente |
| _Ex.: Listagem de eventos_ | _A definir_ | _A definir_ | _A definir_ | Pendente |
| _Ex.: Detalhe do evento_ | _A definir_ | _A definir_ | _A definir_ | Pendente |
| _Ex.: Inscrição_ | _A definir_ | _A definir_ | _A definir_ | Pendente |

### Jornadas

| Jornada | Crítica para Fase 1? | Notas |
| --- | --- | --- |
| Descoberta de eventos | _A definir_ | |
| Inscrição em evento | _A definir_ | |
| Área autenticada | _A definir_ | |

**Perguntas em aberto**

- [ ] Qual jornada deve ficar visualmente consistente primeiro?
- [ ] Layout diferente entre área pública e autenticada?
- [ ] Quais páginas podem usar estrutura simplificada no MVP?

---

## 4. Biblioteca de componentes

### 4.1 Fase 1 — Base

| Componente | Componente MUI | Status |
| --- | --- | --- |
| `Button` | `Button` | Padrão MUI |
| `Input` | `TextField` | Padrão MUI |
| `Textarea` | `TextField` (`multiline`) | Padrão MUI |
| `Select` | `Select` / `TextField` (`select`) | Padrão MUI |
| `Checkbox` | `Checkbox` | Padrão MUI |
| `Radio` | `Radio` / `RadioGroup` | Padrão MUI |
| `Switch` | `Switch` | Padrão MUI |
| `Card` | `Card` | Padrão MUI |
| `Badge` | `Chip` (status) / `Badge` (contador) | Padrão MUI — ver notas de mapeamento |
| `Alert` | `Alert` | Padrão MUI |
| `Toast` | `Snackbar` + `Alert` | Padrão MUI |
| `Spinner` | `CircularProgress` | Padrão MUI |
| `Skeleton` | `Skeleton` | Padrão MUI |
| `Container` | `Container` | Padrão MUI |
| `Section` | Compor com `Box`/`Stack` | Sem componente próprio — compor |
| `PageHeader` | Compor com `Box`/`Stack`/`Typography` | Sem componente próprio — compor |

**Estados obrigatórios (Fase 1)**

- [ ] `hover`
- [ ] `focus` (foco visível)
- [ ] `disabled`
- [ ] `loading`
- [ ] `error`

**Feedback**

| Tipo | Padrão escolhido | Status |
| --- | --- | --- |
| Sucesso | `Snackbar` + `Alert` | Padrão MUI |
| Erro | `Alert` / `Snackbar` | Padrão MUI |
| Validação de formulário | `TextField` (`error` + `helperText`) | Padrão MUI (lógica com react-hook-form + zod) |

### 4.2 Fase 2 — Navegação e interação

| Componente | Componente MUI | Status |
| --- | --- | --- |
| `Dialog` / `Modal` | `Dialog` | Padrão MUI (Fase 2) |
| `Popover` | `Popover` | Padrão MUI (Fase 2) |
| `DropdownMenu` | `Menu` | Padrão MUI (Fase 2) |
| `Tabs` | `Tabs` | Padrão MUI (Fase 2) |

### 4.3 Fase 3 — Domínio (eventos)

Componentes de domínio: **não há equivalente padrão no MUI** — construir localmente, compondo primitivos MUI.

| Componente | Base MUI (composição) | Status |
| --- | --- | --- |
| `EventCard` | `Card` + `Typography` + `Chip` | Planejado (custom) |
| `EventListItem` | `ListItem` / `Card` | Planejado (custom) |
| `EventFilters` | `TextField` + `Select` + `Chip` | Planejado (custom) |
| `DateRangeFilter` | `@mui/x-date-pickers` (`DateRangePicker`) | Planejado (custom) |
| `EnrollmentStatusBadge` | `Chip` | Planejado (custom) |
| `EmptyState` | `Box`/`Stack` + `Typography` | Planejado (custom) |

---

## 5. Acessibilidade e consistência

| Critério | Decisão | Status |
| --- | --- | --- |
| Nível alvo | _A definir_ (ex.: WCAG 2.1 AA) | Pendente |
| Foco visível | _A definir_ | Pendente |
| Navegação por teclado | Obrigatória em componentes interativos | Pendente |
| Biblioteca de ícones | _A definir_ | Pendente |
| Validador de contraste | _A definir_ | Pendente |
| Responsável por validação visual/a11y | _A definir_ | Pendente |

### Definition of Done — componente (Fase 1)

- [ ] API de props alinhada aos demais componentes da biblioteca
- [ ] Estados interativos e de erro implementados
- [ ] Acessibilidade básica (teclado, foco, ARIA quando necessário)
- [ ] Exemplo de uso em pelo menos uma página do MVP

---

## 6. Governança

| Papel | Responsável | Status |
| --- | --- | --- |
| Aprovação de mudanças visuais | _A definir_ | Pendente |
| Manutenção da documentação | _A definir_ | Pendente |
| Onde documentar componentes no código | _A definir_ (ex.: Storybook, `components/ui/`) | Pendente |

---

## 7. Convenções de implementação (MUI)

Regras para manter o código coeso entre a equipe (e agentes de IA). Detalhes de
arquitetura em [arquitetura-frontend.md](./arquitetura-frontend.md).

**Estilo**

- Estilizar **só** via tema MUI + prop `sx` (ou `styled`). **Sem Tailwind.**
- **Nunca** usar cor hex hardcoded: usar `theme.palette.*` (ex.: `color: "text.secondary"`,
  `bgcolor: "primary.main"`). Espaçamento sempre por `theme.spacing` (números no `sx`).
- No MUI v9 o `Stack` só tipa `direction`, `spacing`, `divider`, `useFlexGap`, `sx`.
  Passar `alignItems`/`justifyContent`/`flexWrap` **dentro do `sx`** (no `Box`/`Grid`
  esses props funcionam direto).
- Largura de conteúdo com `Container maxWidth`: público/landing `lg`; formulários de
  auth `xs`; páginas de conteúdo em painel/gestão `md`–`lg`.

**Componentes**

- Reutilizar os compartilhados: layout (`Header`, `Footer`, `Sidebar`,
  `DashboardShell`, `PageHeader`, `Section`), ui (`PagePlaceholder`, `EmptyState`) e
  domínio (`EventCard`). Criar novos componentes de domínio em `components/domain`.
- Ícones de `@mui/icons-material`; status via `Chip` (o `Badge` é contador);
  feedback via `Snackbar`+`Alert`; datas via `@mui/x-date-pickers`.

**Navegação e dados**

- Links: usar `href="…"` em `Button`/`Link`/`ListItemButton`/`CardActionArea` — o
  `LinkBehavior` (registrado no tema) integra o `next/link`. Não passar
  `component={NextLink}` a partir de Server Components.
- Dados sempre via `@/lib/api` (nunca `fetch` direto nem `@/lib/mock`).

**Formulários**

- `react-hook-form` + `zod` (`@hookform/resolvers`) para estado/validação; campos MUI
  com `error` + `helperText`.

**Brief por página**

- Todo `page.tsx` começa com o bloco de brief (template em
  [atribuicoes.md](./atribuicoes.md) §4) e respeita o *Definition of Done* de lá.

## Referências

- [shadcn/ui](https://ui.shadcn.com/docs)
- [Radix Primitives](https://www.radix-ui.com/primitives/docs)
- [Headless UI](https://headlessui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
