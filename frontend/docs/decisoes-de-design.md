# Decisões de Design — Frontend AcadEvent

Versão: 0.1  
Data: 2026-06-09  
Autor: João Vitor Antunes da Silva (SPM)  
Revisores: —

---

Documento vivo das decisões visuais e de componentes do frontend. Objetivo: permitir implementação consistente sem reabrir discussões já fechadas.

Padrão de autoria e revisão: [docs/padrao-de-documentacao.md](../../docs/padrao-de-documentacao.md).

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
| Abordagem de componentes | _A definir_ (ex.: shadcn/ui + Radix + Tailwind) | Pendente | — | |
| Primitivos headless | _A definir_ (ex.: Radix UI / Headless UI) | Pendente | — | |
| Ícones | _A definir_ (ex.: lucide-react) | Pendente | — | |
| Formulários | _A definir_ (ex.: react-hook-form + zod) | Pendente | — | |
| Datas / calendário | _A definir_ (ex.: react-day-picker) | Pendente | — | |

### Critérios de reuso vs criação

- **Reutilizar:** comportamento e acessibilidade já resolvidos; customização principalmente visual.
- **Criar localmente:** componentes de domínio (eventos, inscrição, status).
- **Evitar:** customizações profundas em libs de terceiros que aumentem custo de manutenção.

---

## 2. Identidade visual (Fase 1)

### 2.1 Cores

| Token | Valor | Uso | Status |
| --- | --- | --- | --- |
| `primary` | _A definir_ | Ações principais, links de destaque | Pendente |
| `primary-hover` | _A definir_ | Hover em botões e links primários | Pendente |
| `background` | _A definir_ | Fundo da aplicação | Pendente |
| `foreground` | _A definir_ | Texto principal | Pendente |
| `muted` | _A definir_ | Texto secundário, placeholders | Pendente |
| `success` | _A definir_ | Confirmações, estados positivos | Pendente |
| `warning` | _A definir_ | Alertas não críticos | Pendente |
| `error` | _A definir_ | Erros, ações destrutivas | Pendente |
| `info` | _A definir_ | Informações neutras | Pendente |

**Perguntas em aberto**

- [ ] Cor primária da marca e variações (hover, active, contraste)?
- [ ] Contraste mínimo: WCAG AA?
- [ ] Modo escuro na Fase 1 ou fase posterior?

### 2.2 Tipografia

| Papel | Família | Tamanho / peso | Status |
| --- | --- | --- | --- |
| Display / H1 | _A definir_ | _A definir_ | Pendente |
| Heading / H2–H3 | _A definir_ | _A definir_ | Pendente |
| Body | _A definir_ | _A definir_ | Pendente |
| Caption / legenda | _A definir_ | _A definir_ | Pendente |

**Perguntas em aberto**

- [ ] Manter Geist (já configurada no layout) ou trocar?
- [ ] Escala tipográfica fixa ou fluida?

### 2.3 Espaçamento, grid e forma

| Aspecto | Decisão | Status |
| --- | --- | --- |
| Escala de espaçamento | _A definir_ (ex.: 4, 8, 12, 16, 24, 32) | Pendente |
| Largura máxima de conteúdo | _A definir_ | Pendente |
| Breakpoints | Tailwind padrão / customizado | Pendente |
| Border radius | _A definir_ | Pendente |
| Sombras | _A definir_ | Pendente |
| Densidade visual | Compacta / arejada | Pendente |

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

| Componente | Variantes / estados | Usado em | Status |
| --- | --- | --- | --- |
| `Button` | _A definir_ | — | Pendente |
| `Input` | _A definir_ | — | Pendente |
| `Textarea` | _A definir_ | — | Pendente |
| `Select` | _A definir_ | — | Pendente |
| `Checkbox` | _A definir_ | — | Pendente |
| `Radio` | _A definir_ | — | Pendente |
| `Switch` | _A definir_ | — | Pendente |
| `Card` | _A definir_ | — | Pendente |
| `Badge` | _A definir_ | — | Pendente |
| `Alert` | _A definir_ | — | Pendente |
| `Toast` | _A definir_ | — | Pendente |
| `Spinner` | _A definir_ | — | Pendente |
| `Skeleton` | _A definir_ | — | Pendente |
| `Container` | _A definir_ | — | Pendente |
| `Section` | _A definir_ | — | Pendente |
| `PageHeader` | _A definir_ | — | Pendente |

**Estados obrigatórios (Fase 1)**

- [ ] `hover`
- [ ] `focus` (foco visível)
- [ ] `disabled`
- [ ] `loading`
- [ ] `error`

**Feedback**

| Tipo | Padrão escolhido | Status |
| --- | --- | --- |
| Sucesso | _A definir_ (toast / alert / inline) | Pendente |
| Erro | _A definir_ | Pendente |
| Validação de formulário | _A definir_ | Pendente |

### 4.2 Fase 2 — Navegação e interação

| Componente | Status |
| --- | --- |
| `Dialog` / `Modal` | Planejado |
| `Popover` | Planejado |
| `DropdownMenu` | Planejado |
| `Tabs` | Planejado |

### 4.3 Fase 3 — Domínio (eventos)

| Componente | Status |
| --- | --- |
| `EventCard` | Planejado |
| `EventListItem` | Planejado |
| `EventFilters` | Planejado |
| `DateRangeFilter` | Planejado |
| `EnrollmentStatusBadge` | Planejado |
| `EmptyState` | Planejado |

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

## Referências

- [shadcn/ui](https://ui.shadcn.com/docs)
- [Radix Primitives](https://www.radix-ui.com/primitives/docs)
- [Headless UI](https://headlessui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
