# Atribuições do Frontend — AcadEvent

Versão: 1.1
Data: 2026-08-12
Autor: Guilherme Zanan Piveta (SFE)
Revisores: —

---

Divisão de trabalho da camada de apresentação entre a equipe. Cada página já
existe como `page.tsx` com um **brief** no topo; o dono abre o arquivo e o
substitui por conteúdo real. Rotas e prioridades vêm do
[mapa-de-paginas.md](./mapa-de-paginas.md); padrões visuais/código em
[decisoes-de-design.md](./decisoes-de-design.md) e
[arquitetura-frontend.md](./arquitetura-frontend.md).

Formatação segue o [padrão de documentação](../../docs/padrao-de-documentacao.md).

---

## 1. Donos por área

Divisão por *route group* (esforço aproximadamente equilibrado). Ajuste os nomes
conforme a equipe combinar.

| Dono | Áreas (pasta) | Rotas | Prioridade dominante |
| --- | --- | --- | --- |
| **Guilherme** | Fundação (`theme/`, `components/`, `lib/`), **landing** `/`, descoberta `(public)/eventos` e `/eventos/[slug]`, institucionais (`sobre`/`termos`/`privacidade`), utilitárias (`not-found`/`error`/`loading`) | base + ~6 | MVP |
| **Kauan** | `(auth)/` + `(painel)/` (painel do usuário completo: participante, ministrante, comissão, patrocinador) | ~22 | MVP |
| **Arthur** | `(gerenciar)/` (gestão do evento — organizador/comissão) | ~22 | MVP |
| **Igor** | páginas internas do evento em `(public)` (cronograma, atividades, ministrantes, patrocinadores, galeria, anais, validar), fluxo `(inscricao)` e `(admin)/` | ~20 | MVP |

> A landing (`/`) e a listagem `/eventos` já estão implementadas como **referência**.

## 2. Ordem de construção

Com dados mock, quase toda página é independente — então a ordem é guiada por:

1. **Caminho demonstrável primeiro** — priorizar a jornada que mostra o produto
   funcionando de ponta a ponta (descobrir → ver evento → inscrever → ver no painel).
2. **MVP antes de Pós-MVP** — entrega P3 exige ≥50% dos casos de uso. Deixar as
   Pós-MVP (anais, validar, notificações, check-in, logs, recuperação de senha) por último.
3. **Dois padrões de referência cedo** — assim que existirem, replicam-se rápido nas
   dezenas de telas parecidas:
   - **Formulário** (`react-hook-form` + `zod` + campos MUI): primeiro em
     `/gerenciar/eventos/novo` (Arthur) → todos copiam.
   - **Tabela + Dialog de edição** (CRUD): primeiro em `/gerenciar/[slug]/inscricoes`
     (Arthur) → base das telas de gestão.

### Onda 1 — Caminho feliz (um evento visível + inscrição + painel)

*Meta: um visitante encontra um evento, se inscreve e vê no painel. É o "demo".*

| Dono | Faça nesta ordem |
| --- | --- |
| **Guilherme** | 1) `/eventos/[slug]` (página do evento — hub com botão inscrever) · 2) componentes de domínio compartilhados: `EnrollmentStatusBadge`, `EventFilters`, `EventListItem` |
| **Kauan** | 1) `/login` · 2) `/cadastro` · 3) `/painel` · 4) `/painel/eventos/[slug]` (visão geral) |
| **Igor** | 1) `/eventos/[slug]/inscricao` → 2) `.../atividades` → 3) `.../pagamento` → 4) `.../confirmacao` · 5) `/eventos/[slug]/cronograma` · 6) `/eventos/[slug]/atividades` (+ `/[id]`) |
| **Arthur** | 1) `/gerenciar/eventos/novo` (**padrão de formulário**) · 2) `/gerenciar/eventos` · 3) `/gerenciar/[slug]` (dashboard) |

### Onda 2 — Gestão completa + área do participante

| Dono | Faça nesta ordem |
| --- | --- |
| **Arthur** | `/gerenciar/[slug]/inscricoes` (**padrão de tabela+dialog**) → configuracoes → prazos → modulos → atividades → espacos → ministrantes → pagamentos → pessoas |
| **Kauan** | painel: grade → inscricoes → recibos → certificados · `/painel/perfil` |
| **Igor** | `/eventos/[slug]/ministrantes` (+ `/[id]`) → patrocinadores → galeria · admin: `/admin` → `/admin/usuarios` → `/admin/eventos` |
| **Guilherme** | institucionais (`sobre`/`termos`/`privacidade`) · apoiar/revisar PRs |

### Onda 3 — Módulos avançados + papéis especiais + Pós-MVP

| Dono | Faça nesta ordem |
| --- | --- |
| **Arthur** | submissoes (+ `/[id]/parecer`) → materiais → inventario → comunicacao → divulgacao → certificados → relatorios → check-in *(Pós-MVP)* |
| **Kauan** | ministrante (painel → perfil → presença → materiais → certificados) → escala (+ presenca) → patrocinio → submissoes (+ nova) → atividades/[id]/materiais → notificacoes *(Pós-MVP)* |
| **Igor** | inscrição: revisar conflitos/anti-bot · `/eventos/[slug]/anais` *(Pós-MVP)* → `/validar/[codigo]` *(Pós-MVP)* → `/admin/logs` *(Pós-MVP)* |
| **Kauan** | `/recuperar-senha`, `/redefinir-senha/[token]` *(Pós-MVP)* |

> Dentro de cada onda, siga a ordem numerada/listada. Não comece a Onda 2 de uma
> área antes de fechar a Onda 1 dela — assim o "demo" fica pronto o quanto antes.

## 3. Como pegar uma página

1. Abra o `page.tsx` da rota (a estrutura de pastas espelha a URL).
2. Leia o **brief** no topo do arquivo: propósito, componentes MUI, dados, estados
   e *definition of done*. Consulte os RFs citados no
   [documento de requisitos](./acad_event_requirements.md) para detalhes de
   feature (ex.: contagem regressiva RF01.2.5, QR check-in RF04.8, conflito de
   horário RF05.4).
3. Substitua o `<PagePlaceholder />` pela implementação real, consumindo dados via
   `@/lib/api` e usando os componentes/tema compartilhados.
4. Marque a rota como concluída na tabela da §5 ao abrir o PR.

## 4. Template de brief de página

Todo `page.tsx` começa com este bloco (já preenchido nos stubs):

```tsx
/**
 * ROTA: /caminho/da/rota
 * OWNER: Nome   RF: RFxx.y   PRIORIDADE: MVP | Pós-MVP
 * PROPÓSITO: o que a página faz, em uma frase.
 * COMPONENTES: componentes MUI/domínio a usar (ex.: Container, Table, EventCard).
 * DADOS: função de @/lib/api que fornece os dados (nunca fetch direto).
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert).
 * DONE: responsivo, tokens do tema (sem cor hardcoded), estados cobertos,
 *   placeholder substituído.
 */
```

### Definition of Done (por página)

- [ ] Consome dados via `@/lib/api` (mock por enquanto), nunca `fetch` direto.
- [ ] 100% MUI + `sx`; **nenhuma cor hardcoded** (usar `theme.palette`).
- [ ] Responsiva (xs → lg) e com foco visível/teclado nos elementos interativos.
- [ ] Estados de loading, vazio e erro tratados quando aplicável.
- [ ] Sem erros de `npm run build` e `npm run lint`.

## 5. Acompanhamento (checklist de rotas)

Atualize o status ao concluir. Legenda: ⬜ a fazer · 🟨 em andamento · ✅ pronto.

### Guilherme — fundação e público (referência)
- ✅ `/` landing · ✅ `/eventos` · ⬜ `/eventos/[slug]`
- ⬜ `/sobre` · ⬜ `/termos` · ⬜ `/privacidade`

### Kauan — autenticação e painel
- ⬜ `/login` · ⬜ `/cadastro` · ⬜ `/recuperar-senha` · ⬜ `/redefinir-senha/[token]`
- ⬜ `/painel` · ⬜ `/painel/perfil` · ⬜ `/painel/notificacoes`
- ⬜ `/painel/eventos/[slug]` (+ grade, inscricoes, recibos, certificados,
  submissoes, submissoes/nova, atividades/[id]/materiais)
- ⬜ ministrante (painel, perfil, presença, materiais, certificados) ·
  ⬜ escala (+ presenca) · ⬜ patrocinio

### Arthur — gestão do evento
- ⬜ `/gerenciar/eventos` · ⬜ `/gerenciar/eventos/novo` · ⬜ `/gerenciar/[slug]`
- ⬜ configuracoes · prazos · modulos · atividades · espacos · inscricoes ·
  pagamentos · check-in · pessoas · escala · ministrantes · patrocinadores ·
  submissoes (+ [id]/parecer) · materiais · inventario · comunicacao ·
  divulgacao · certificados · relatorios

### Igor — evento (público), inscrição e admin
- ⬜ cronograma · atividades (+ [id]) · ministrantes (+ [id]) · patrocinadores ·
  anais · galeria · `/validar/[codigo]`
- ⬜ `/eventos/[slug]/inscricao` (+ atividades, pagamento, confirmacao)
- ⬜ `/admin` · `/admin/usuarios` · `/admin/eventos` · `/admin/logs`

## 6. Fluxo de trabalho (Git)

- Ramifique de `dev`: `feature/<area>-<pagina>` (ex.: `feature/painel-grade`).
- Um PR por página (ou por conjunto coeso pequeno); descreva a rota e o RF.
- CI roda testes/validação; peça revisão a outro membro antes do merge em `dev`.
- Detalhes em [docs/fluxo-de-branches.md](../../docs/fluxo-de-branches.md).
