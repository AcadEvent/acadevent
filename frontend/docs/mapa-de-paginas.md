# Mapa de Páginas — Frontend AcadEvent

Versão: 0.1  
Data: 2026-06-20  
Autor: Guilherme Zanan Piveta (SFE)  
Revisores: —

---

Levantamento das páginas (rotas) do frontend derivadas do **Documento de Requisitos do AcadEvent v2.0** (2026-03-17). Objetivo: enumerar tudo que precisa ser construído na camada de apresentação, mapear cada rota aos requisitos funcionais (RF) que atende e priorizar a construção.

Padrão de autoria e revisão: [docs/padrao-de-documentacao.md](../../docs/padrao-de-documentacao.md).  
Decisões de stack e componentes: [decisoes-de-design.md](./decisoes-de-design.md).

> Este é um documento de inventário, não de implementação. Nomes de rota são propostas e podem mudar; cada linha referencia os RFs que a justificam para garantir rastreabilidade.

---

## 1. Convenções de rota

- Stack: Next.js (App Router). Segmentos dinâmicos em `[colchetes]`.
- `[slug]` identifica o evento (gerado a partir de sigla + edição); `[id]` identifica um recurso dentro do evento.
- Agrupamento por área de acesso (route groups do Next.js):
  - **Público** — sem autenticação.
  - **`/login`, `/cadastro`, …** — fluxo de autenticação.
  - **`/painel`** — área autenticada do usuário (participante, ministrante, patrocinador).
  - **`/gerenciar/[slug]`** — área do organizador/comissão do evento.
  - **`/admin`** — área do administrador da plataforma.
- **Prioridade** reflete a maior prioridade entre os RFs atendidos: **MVP** (contém algum MH) ou **Pós-MVP** (apenas SH/CH).

---

## 2. Visão geral das áreas

| Área | Prefixo | Acesso | Perfil principal |
| --- | --- | --- | --- |
| Pública | `/`, `/eventos` | Aberto | Visitante (não autenticado) |
| Autenticação | `/login`, `/cadastro` | Aberto | Qualquer usuário |
| Inscrição | `/eventos/[slug]/inscricao` | Autenticado | Participante |
| Painel do usuário | `/painel` | Autenticado | Participante, Ministrante, Patrocinador |
| Gestão do evento | `/gerenciar/[slug]` | Autorizado (RBAC) | Organizador / Comissão |
| Administração | `/admin` | Autorizado (RBAC) | Administrador do Sistema |

---

## 3. Área pública (sem autenticação)

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/` | Home / descoberta — vitrine de eventos públicos, busca | RF, acesso público | MVP |
| `/eventos` | Listagem de eventos publicados, com filtros | RF01.5.1 | MVP |
| `/eventos/[slug]` | Página pública do evento (dados cadastrais, status de inscrição, divulgação) | RF01.5.1–RF01.5.4 | MVP |
| `/eventos/[slug]/cronograma` | Cronograma público por dia e por sala/espaço | RF05.2 | MVP |
| `/eventos/[slug]/atividades` | Lista pública de atividades | RF01.5.2, RF05.1 | MVP |
| `/eventos/[slug]/atividades/[id]` | Detalhe da atividade (descrição, ministrantes, horário, vagas) | RF05.1, RF05.5 | MVP |
| `/eventos/[slug]/ministrantes` | Lista de ministrantes com dados profissionais | RF02.2.5, RF01.5.2 | MVP |
| `/eventos/[slug]/ministrantes/[id]` | Perfil público do ministrante | RF02.2.4 | MVP |
| `/eventos/[slug]/patrocinadores` | Patrocinadores por nível de patrocínio | RF01.5.2, RF02.2.2 | MVP |
| `/eventos/[slug]/anais` | Anais — trabalhos aceitos publicados | RF06.6 | Pós-MVP |
| `/eventos/[slug]/galeria` | Galeria pública de fotos e mídias | RF12.2 | MVP |
| `/validar/[codigo]` | Validação pública de autenticidade de certificado | RF11.7 | Pós-MVP |

---

## 4. Autenticação

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/login` | Login (e-mail + senha) | RF02.1.1, RNF03.1 | MVP |
| `/cadastro` | Cadastro de usuário | RF02.1.1 | MVP |
| `/recuperar-senha` | Solicitação de recuperação por e-mail | RF02.1.4 | Pós-MVP |
| `/redefinir-senha/[token]` | Definição de nova senha via link | RF02.1.4 | Pós-MVP |

---

## 5. Inscrição (autenticado)

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/eventos/[slug]/inscricao` | Fluxo de inscrição no evento (≤ 5 passos) | RF01.5.3, RF03.1.x, RNF04.4 | MVP |
| `/eventos/[slug]/inscricao/atividades` | Seleção de atividades, respeitando capacidade e conflito de horário | RF05.3, RF05.4 | MVP |
| `/eventos/[slug]/inscricao/pagamento` | Checkout — lote, cupom, status de pagamento | RF04.1–RF04.4, RF04.9 | MVP |
| `/eventos/[slug]/inscricao/confirmacao` | Confirmação + recibo | RF04.6, RF09.1 | MVP |

---

## 6. Painel do usuário (`/painel`)

Hub pessoal multi-evento; conteúdo por evento é escopado em `/painel/eventos/[slug]`.

### 6.1 Geral

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/painel` | Hub — meus eventos, atalhos, notificações | RF03.1.1, RF03.1.5 | MVP |
| `/painel/perfil` | Dados da conta do usuário | RF02.1.1 | MVP |
| `/painel/notificacoes` | Central de notificações | RF03.1.5, RF09.4 | Pós-MVP |

### 6.2 Participante — por evento

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/painel/eventos/[slug]` | Painel pessoal do evento (visão geral) | RF03.1.1 | MVP |
| `/painel/eventos/[slug]/grade` | Grade personalizada das atividades inscritas | RF03.1.6 | MVP |
| `/painel/eventos/[slug]/inscricoes` | Histórico de inscrições e status de pagamento | RF03.1.2 | MVP |
| `/painel/eventos/[slug]/recibos` | Download de recibos de pagamento | RF03.1.3 | MVP |
| `/painel/eventos/[slug]/certificados` | Download de certificados (pós-evento) | RF03.1.4, RF11.1 | MVP |
| `/painel/eventos/[slug]/submissoes` | Minhas submissões e seus status | RF03.1.7 | MVP |
| `/painel/eventos/[slug]/submissoes/nova` | Submeter trabalho (título, resumo, área, PDF) | RF06.1, RF06.7 | MVP |
| `/painel/eventos/[slug]/atividades/[id]/materiais` | Materiais das atividades inscritas | RF10.3 | MVP |

### 6.3 Ministrante — por evento

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/painel/eventos/[slug]/ministrante` | Painel do ministrante (suas atividades) | RF02.2.3, RF05.5 | MVP |
| `/painel/eventos/[slug]/ministrante/perfil` | Dados profissionais por evento (bio, foto, instituição) | RF02.2.4 | MVP |
| `/painel/eventos/[slug]/ministrante/atividades/[id]/presenca` | Registro de frequência/presença dos participantes | RF05.6 | MVP |
| `/painel/eventos/[slug]/ministrante/atividades/[id]/materiais` | Upload de materiais da atividade | RF10.2 | MVP |
| `/painel/eventos/[slug]/ministrante/certificados` | Certificados do ministrante | RF11.2 | MVP |

### 6.4 Membro da comissão — por evento

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/painel/eventos/[slug]/escala` | Meus turnos e carga horária acumulada | RF02.2.6, RF02.2.7 | MVP |
| `/painel/eventos/[slug]/escala/presenca` | Confirmar/registrar presença em turno | RF02.2.8 | MVP |

### 6.5 Patrocinador — por evento

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/painel/eventos/[slug]/patrocinio` | Dados de visibilidade e gestão do perfil de patrocínio | RF02.2.2 | MVP |

---

## 7. Gestão do evento — Organizador (`/gerenciar/[slug]`)

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/gerenciar/eventos` | Lista de eventos que o usuário organiza | RF01.3.3 | MVP |
| `/gerenciar/eventos/novo` | Cadastro de novo evento | RF01.1.1–RF01.1.5 | MVP |
| `/gerenciar/[slug]` | Dashboard do organizador | RF03.2.1 | MVP |
| `/gerenciar/[slug]/configuracoes` | Dados cadastrais, identidade visual, local, redes | RF01.1.1–RF01.1.6 | MVP |
| `/gerenciar/[slug]/prazos` | Períodos do evento, inscrição e submissão; capacidade | RF01.2.1–RF01.2.5, RF01.3.1 | MVP |
| `/gerenciar/[slug]/modulos` | Ativar/desativar módulos, status e edições | RF01.3.2–RF01.3.6, RF03.2.2 | MVP |
| `/gerenciar/[slug]/atividades` | CRUD de atividades; associar ministrantes | RF05.1, RF05.5, RF03.2.9 | MVP |
| `/gerenciar/[slug]/espacos` | Cadastro de espaços e reservas (conflito/capacidade) | RF07.1–RF07.4 | MVP |
| `/gerenciar/[slug]/inscricoes` | Gestão de inscrições, lotes e cupons | RF04.1–RF04.3, RF03.2.3 | MVP |
| `/gerenciar/[slug]/pagamentos` | Status de pagamentos, confirmação manual, relatório financeiro | RF04.4–RF04.7, RF03.2.7 | MVP |
| `/gerenciar/[slug]/check-in` | Validação de check-in via QR Code na portaria | RF04.8 | Pós-MVP |
| `/gerenciar/[slug]/pessoas` | Comissão, grupos de trabalho e funções | RF02.2.1, RF03.2.8 | MVP |
| `/gerenciar/[slug]/escala` | Turnos, carga horária, validação de presença, conflitos | RF02.2.6–RF02.2.12 | MVP |
| `/gerenciar/[slug]/ministrantes` | Convidar/cadastrar ministrantes | RF02.2.3 | MVP |
| `/gerenciar/[slug]/patrocinadores` | Cadastro e níveis de patrocínio | RF02.2.2 | MVP |
| `/gerenciar/[slug]/submissoes` | Gerenciar submissões, atribuir pareceristas, regras | RF06.2, RF06.5, RF06.7, RF03.2.4 | MVP |
| `/gerenciar/[slug]/submissoes/[id]/parecer` | Avaliação/parecer do trabalho | RF06.3, RF06.4 | MVP |
| `/gerenciar/[slug]/materiais` | Repositório de conteúdo digital do evento | RF10.1 | MVP |
| `/gerenciar/[slug]/inventario` | Itens, distribuição/baixa, alertas de estoque | RF08.1–RF08.4 | MVP |
| `/gerenciar/[slug]/comunicacao` | Comunicados gerais e segmentados | RF09.2–RF09.4 | MVP |
| `/gerenciar/[slug]/divulgacao` | Mídias, banners, flyers, exportação para redes | RF12.1, RF12.3 | MVP |
| `/gerenciar/[slug]/certificados` | Configuração e emissão de certificados | RF01.4.1–RF01.4.4, RF11.1–RF11.7 | MVP |
| `/gerenciar/[slug]/relatorios` | Relatórios (inscritos, financeiro, presença, escala, etc.) | RF13.1–RF13.9 | MVP |

> O preview da página pública independente do status (RF03.2.5) é atendido reutilizando `/eventos/[slug]` em modo organizador, não por uma rota separada.

---

## 8. Administração da plataforma (`/admin`)

| Rota | Página | RFs atendidos | Prioridade |
| --- | --- | --- | --- |
| `/admin` | Dashboard administrativo | RF02.1.2 | MVP |
| `/admin/usuarios` | Gestão de usuários, perfis e exclusão | RF02.1.3 | MVP |
| `/admin/eventos` | Múltiplos eventos, arquivar/excluir | RF01.3.6 | MVP |
| `/admin/logs` | Consulta do log assíncrono de atividades | RF16.3 | Pós-MVP |

---

## 9. Páginas utilitárias

| Rota | Página | Notas |
| --- | --- | --- |
| `not-found` | 404 | Rota inexistente / evento não publicado |
| `error` | Erro genérico | Boundary de erro com mensagem orientada ao usuário (RNF04.3) |
| `loading` | Estados de carregamento | Skeletons por rota (App Router) |
| `/sobre`, `/termos`, `/privacidade` | Institucionais | Rodapé; baixa prioridade |

---

## 10. Resumo quantitativo

| Área | Rotas (aprox.) | MVP |
| --- | --- | --- |
| Pública | 12 | 10 |
| Autenticação | 4 | 2 |
| Inscrição | 4 | 4 |
| Painel do usuário | 18 | 16 |
| Gestão do evento | 22 | 21 |
| Administração | 4 | 3 |
| Utilitárias | ~6 | — |

---

## 11. Perguntas em aberto

- [ ] Painel do ministrante/patrocinador: sub-rotas de `/painel` ou áreas próprias?
- [ ] Gestão do evento: SPA densa com tabs ou rotas separadas por seção (como mapeado acima)?
- [ ] Inscrição: fluxo multi-passo em rota única (wizard) ou rotas por passo? (impacta RNF04.4)
- [ ] PWA/mobile (RNF04.2): mesmas rotas responsivas ou shell dedicado?
- [ ] Identificador do evento na URL: `slug` legível vs. `id`.

---

