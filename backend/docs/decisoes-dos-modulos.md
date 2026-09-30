# Decisões de Projeto por Módulo — Backend AcadEvent

Versão: 1.0  
Data: 2026-09-30  
Autor: Sizenando França (SBE)  
Revisores: José Carlos da Silva Filho (SPM)

---

A formatação deste documento segue o [padrão de documentação do projeto](../../docs/padrao-de-documentacao.md).  
Para decisões complementares, consulte: [Arquitetura](./decisoes-de-arquitetura.md), [Segurança](./decisoes-de-seguranca.md), [Banco e Concorrência](./decisoes-de-banco-e-concorrencia.md) e [Contratos de API](./decisoes-de-api.md).

## 1. Visão Geral

Este documento detalha as decisões técnicas, regras de negócio, contratos de API, vulnerabilidades mitigadas e suíte de testes de cada um dos módulos implementados no backend do AcadEvent (12 módulos de negócio e o módulo de persistência relacional Prisma), consolidando as entregas do Marco P3 e as deliberações do PR #44.

---

## 2. Módulo `auth` (RF02 / RNF03 — Autenticação e Autorização)

### 2.1 Finalidade e Escopo

Responsável pela criação de contas de usuário, autenticação com geração de tokens JWT, extração de perfis de acesso e aplicação do modelo RBAC (Role-Based Access Control).

### 2.2 Endpoints Expostos

- `POST /auth/cadastro` — Registro de novo participante (`CadastroDto`). Retorna dados do usuário e token JWT inicial.
- `POST /auth/login` — Autenticação por credenciais (`LoginDto`). Retorna `access_token` Bearer.
- `GET /auth/me` — Consulta do perfil autenticado (`JwtAuthGuard`). Retorna dados cadastrais e array de `perfis`.

### 2.3 Regras de Negócio e Decisões de Projeto

1. **Hash de Senhas:** Aplicação de `bcrypt` com 10 salt rounds na criação de conta. O campo `senha_hash` é estritamente expurgado em todas as respostas JSON.
2. **Auto-atribuição de Papel:** Todo usuário cadastrado via `/auth/cadastro` recebe automaticamente o perfil `participante` na tabela `perfil_usuario` e o respectivo registro em `perfil_participante`.
3. **Fail-Fast de JWT (CWE-798):** Tanto no `JwtModule.registerAsync` quanto na `JwtStrategy`, a inicialização do backend falha com exceção crítica se a variável `JWT_SECRET` não estiver presente no ambiente.
4. **Bypass de Administrador:** No `RolesGuard`, qualquer usuário portador do papel `'administrador'` recebe autorização imediata para todas as rotas protegidas por papéis.

### 2.4 Testes Unitários

- `auth.service.spec.ts`: Validação de cadastro, hash de senha, login bem-sucedido e rejeição por credenciais inválidas.
- `jwt.strategy.spec.ts`: Extração correta do payload do token e validação do fail-fast sem `JWT_SECRET`.
- `roles.guard.spec.ts`: Testes de liberação de rotas públicas, restrição por papéis específicos e bypass de administrador.

---

## 3. Módulo `eventos` (RF01 — Gestão de Eventos e Edições)

### 3.1 Finalidade e Escopo

Gerencia a criação da marca/evento e de suas edições, vitrine pública, painel administrativo do organizador e transição formal de estados da edição.

### 3.2 Endpoints Expostos

- `POST /eventos` — Cadastro atômico de marca de evento e edição inicial (`CriarEventoDto`).
- `GET /eventos` — Vitrine pública de eventos ativos (`status_evento = 'Publicado'`).
- `GET /eventos/:slug` — Consulta detalhada de edição por slug ou por ID numérico (inclui lotes, espaços e atividades).
- `GET /eventos/gerenciar/meus` — Listagem de eventos pertencentes ao organizador autenticado.
- `PATCH /eventos/edicoes/:id/status` — Atualização de status da edição (`AtualizarStatusDto`).

### 3.3 Regras de Negócio e Decisões de Projeto

1. **Criação Atômica (`prisma.$transaction`):** O evento (marca) e a edição inicial são gerados juntos. Se o usuário autenticado ainda não possuir perfil de organizador, ele é auto-promovido dentro da mesma transação.
2. **Normalização de Slugs (Kebab-Case #74):** Geração determinística de slugs amigáveis baseados na sigla e número da edição. Colisões de slug são tratadas com sufixos numéricos incrementais (`slug-1`, `slug-2`).
3. **Máquina de Estados de Edição:**
   ```text
   Rascunho     -> [Publicado, Arquivado]
   Publicado    -> [Em andamento, Encerrado, Arquivado, Rascunho]
   Ativo        -> [Em andamento, Encerrado, Arquivado, Rascunho]
   Em andamento -> [Encerrado, Arquivado]
   Encerrado    -> [Arquivado]
   Arquivado    -> [] (Estado terminal)
   ```
4. **Prevenção de IDOR:** A rota de alteração de status valida se o usuário autenticado é administrador global ou o organizador associado à marca do evento (`edicao.evento.id_organizador === perfilOrg.id_organizador`).
5. **Proteção de Cupons:** A consulta pública `GET /eventos/:slug` não expõe a relação de cupons nem percentuais de desconto.

### 3.4 Testes Unitários

- `eventos.service.spec.ts`: Cobertura completa de criação atômica, normalização de slug, busca por slug/ID, listagem por organizador, validação de transições válidas e bloqueio de transições inválidas na máquina de estados.

---

## 4. Módulo `espacos` (RF07 — Gestão e Reserva de Espaços Físicos)

### 4.1 Finalidade e Escopo

Controle de salas, auditórios, laboratórios e recursos físicos alocados a uma edição, além da reserva desses espaços para atividades acadêmicas.

### 4.2 Endpoints Expostos

- `POST /espacos` — Criação de novo espaço físico (`CriarEspacoDto`).
- `GET /espacos/edicao/:id_edicao` — Listagem de espaços vinculados a uma edição.
- `POST /espacos/reservar` — Alocação de espaço para uma atividade acadêmica (`ReservarEspacoDto`).
- `GET /espacos/mapa-ocupacao/edicao/:id_edicao` — Mapa consolidado de ocupação dos espaços da edição.

### 4.3 Regras de Negócio e Decisões de Projeto

1. **RBAC Obrigatório:** O controller é blindado com `@UseGuards(JwtAuthGuard, RolesGuard)` e `@Roles('organizador', 'administrador')`, corrigindo a vulnerabilidade de permissão aberta identificada no PR #44 (Item 2.1).
2. **Prevenção de Vínculo Cruzado entre Edições:** Validação explícita `espaco.id_edicao === atividade.id_edicao`.
3. **Consistência Temporal:** O período da reserva deve estar contido entre a abertura e encerramento da atividade e após a abertura oficial do evento.
4. **Bloqueio Pessimista (`sp_reservar_espaco`):** Executa `PERFORM ... FOR UPDATE` no espaço físico para anular condições de corrida entre reservas simultâneas para o mesmo local e horário.

### 4.4 Testes Unitários

- `espacos.controller.spec.ts`: Validação de chamadas do controller e anotações de guards.
- `espacos.service.spec.ts`: Criação de espaços, reservas com datas válidas, rejeição de datas invertidas, rejeição de cruzamento de edições e conflitos de mapa de ocupação.

---

## 5. Módulo `atividades` (RF03 / RF05 — Atividades, Cronograma e Chamada)

### 5.1 Finalidade e Escopo

Gerencia palestras, workshops, minicursos, mesas-redondas, associação de ministrantes, inscrições em atividades e registro de chamadas/presenças.

### 5.2 Endpoints Expostos

- `POST /atividades` — Criação de nova atividade na edição (`CriarAtividadeDto`).
- `GET /atividades/cronograma/edicao/:id_edicao` — Cronograma público de atividades da edição.
- `POST /atividades/associar-ministrante` — Vinculação de ministrante (`AssociarMinistranteDto`).
- `POST /atividades/inscrever` — Inscrição de participante autenticado em atividade (`InscreverAtividadeDto`).
- `POST /atividades/chamada` — Registro de lista de presenças (`RegistrarPresencaDto`).

### 5.3 Regras de Negócio e Decisões de Projeto

1. **Inscrição Segura e Conflito de Grade:**
   - O participante é identificado exclusivamente pelo token JWT (`@CurrentUser()`).
   - O serviço inspeciona as atividades já inscritas pelo participante e rejeita com `409 Conflict` se houver colisão de horário entre reservas.
2. **Controle de Capacidade e Concorrência Atômica:**
   - A contagem de inscritos e o `create` da nova inscrição ocorrem dentro de `prisma.$transaction`. Se o número de inscritos atingir a capacidade máxima do espaço físico reservado (`capacidade_max`), a transação aborta com `400 Bad Request`, prevenindo overbooking.
3. **Controle de Acesso em Chamada:**
   - Apenas organizadores, ministrantes credenciados ou administradores podem registrar chamadas.
   - Status de presença restrito estritamente a `'Presente'` ou `'Ausente'`.

### 5.4 Testes Unitários

- `atividades.service.spec.ts`: Criação de atividades, detecção de conflitos de agenda na grade do aluno, controle de lotação máxima em transação e validação de permissões na chamada.

---

## 6. Módulo `inscricoes` (RF04 — Inscrições, Lotes, Cupons e Credenciamento)

### 6.1 Finalidade e Escopo

Gerencia a comercialização de lotes de ingresso, cupons promocionais, processo de inscrição do participante e validação de check-in / credenciamento via QR Code.

### 6.2 Endpoints Expostos

- `POST /inscricoes/lotes` — Cadastro de lote de ingressos (`CriarLoteDto`).
- `GET /inscricoes/lotes/edicao/:id_edicao` — Listagem pública de lotes disponíveis.
- `POST /inscricoes/cupons` — Cadastro de cupom de desconto (`CriarCupomDto`).
- `GET /inscricoes/cupons/edicao/:id_edicao` — Listagem de cupons da edição (restrito a organizador/administrador).
- `POST /inscricoes` — Realização de inscrição pelo participante autenticado (`CriarInscricaoDto`).
- `POST /inscricoes/validar-qrcode` — Credenciamento e validação de QR Code (`ValidarQrCodeDto`).

### 6.3 Regras de Negócio e Decisões de Projeto

1. **Venda de Ingressos Concorrente:** Realizada via procedure `sp_realizar_inscricao_edicao` com bloqueio `SELECT ... FOR UPDATE` no lote, impedindo que ingressos excedentes sejam emitidos.
2. **Inscrições Gratuitas (Cupom 100%):** Quando um cupom reduz o valor para R$ 0,00, o sistema auto-confirma a inscrição com status `'Confirmada'`, gera o QR Code e gera o registro de pagamento como `'Aprovado'`, eliminando o travamento eterno como `'Pendente'`.
3. **Validação de Cupons:** O cupom deve pertencer obrigatoriamente à mesma edição do lote selecionado (`cupom.id_edicao === lote.id_edicao`).
4. **Credenciamento e Anti-Replay de QR Code:**
   - O endpoint de validação exige autenticação e papel de organizador ou administrador.
   - O QR Code validado é marcado como utilizado, rejeitando leituras subsequentes com `400 Bad Request`.
   - O objeto do usuário na resposta expurga explicitamente o campo `senha_hash`.

### 6.4 Testes Unitários

- `inscricoes.controller.spec.ts`: Proteção RBAC dos endpoints de cupons, lotes e validação de QR Code.
- `inscricoes.service.spec.ts`: Inscrição com cálculo de desconto, auto-confirmação de gratuidade, rejeição de cupom de outra edição, detecção de replay de QR Code e expurgo de senha.

---

## 7. Módulo `pagamentos` (RF08 — Gateway, Webhooks e Relatórios)

### 7.1 Finalidade e Escopo

Integração com gateways externos de pagamento, confirmação manual de pagamentos de balcão e geração de relatórios consolidados de faturamento.

### 7.2 Endpoints Expostos

- `POST /pagamentos/webhook` — Recepção de eventos assíncronos do gateway (`WebhookPagamentoDto`).
- `POST /pagamentos/confirmar-manual` — Confirmação de balcão por organizador (`ConfirmarPagamentoManualDto`).
- `GET /pagamentos/relatorio/edicao/:id_edicao` — Relatório financeiro consolidado da edição.

### 7.3 Regras de Negócio e Decisões de Projeto

1. **Autenticação Segura de Webhook:**
   - O segredo é validado contra `WEBHOOK_SECRET` com comparação em tempo constante (`crypto.timingSafeEqual`).
   - Sem o segredo configurado no ambiente, o endpoint recusa chamadas com HTTP 401.
2. **Idempotência Refinada:**
   - Reenvios de notificações `'Aprovado'` retornam sucesso sem regerar chaves.
   - Notificações de `'Estornado'` ou `'Cancelado'` transicionam a inscrição e o pagamento correspondentemente, garantindo rastreabilidade de estornos pós-aprovação.
3. **Relatórios Nativos sem OOM (Issue #40):**
   - Agregações estatísticas e somatórios financeiros são executados pelo PostgreSQL (`groupBy` e `aggregate`), sem carga de coleções em memória no Node.js.

### 7.4 Testes Unitários

- `pagamentos.service.spec.ts`: Validação de idempotência de webhook, processamento de estorno pós-aprovação, confirmação manual com recibo e geração de relatório com agregações Prisma.

---

## 8. Módulo `certificados` (RF11 / RF11.5 — Emissão e Motor Gráfico PDF)

### 8.1 Finalidade e Escopo

Emissão de certificados de participação para atividades concluídas, validação pública de autenticidade e renderização dinâmica em PDF no formato A4 Paisagem.

### 8.2 Endpoints Expostos

- `POST /certificados/atividade` — Solicitação de emissão de certificado (`EmitirCertificadoAtividadeDto`).
- `GET /certificados/:codigo/validar` — Consulta pública de validade do certificado.
- `GET /certificados/:codigo/download` — Renderização dinâmica do documento em PDF via stream HTTP.

### 8.3 Regras de Negócio e Decisões de Projeto

1. **Identificação pelo Token JWT (Prevenção de IDOR):**
   - O usuário participante emite o certificado com base no seu próprio token de autenticação. O preenchimento de `id_usuario` no corpo é restrito a organizadores e administradores.
2. **Geração Criptográfica do Código:**
   - O código de autenticidade é gerado pelo servidor através do padrão `AUTH-${randomUUID()}`, prevenindo previsibilidade e colisões.
3. **Propagação de Carga Horária:**
   - A carga horária impressa no certificado provém da coluna `carga_horario` da entidade `Atividade`, substituindo valores estáticos.
4. **Motor Gráfico com PDFKit:**
   - Renderização em memória no formato A4 Paisagem (`landscape`), com bordas decorativas institucionais, dados oficiais do evento, nome do participante em caixa alta e código de autenticidade no rodapé.
5. **Link de Validação Conforme Contrato:**
   - O rodapé do PDF imprime a URL do frontend baseada em `FRONTEND_URL` (`http://localhost:3001/validar/[codigo]`).
6. **Privacidade e LGPD:**
   - A consulta pública de validação mascara o e-mail do titular (`mascararEmail`).

### 8.4 Testes Unitários

- `certificados.service.spec.ts`: Emissão com código UUID, verificação de duplicidade, mascaramento de e-mail na validação pública, renderização de stream de PDF com PDFKit e link com porta 3001.

---

## 9. Módulo `storage` (RF10 / RNF05.4 — Padrão Adapter para Uploads)

### 9.1 Finalidade e Escopo

Upload e disponibilização de arquivos de apoio, comprovantes, apresentações de slides e anexos de trabalhos acadêmicos.

### 9.2 Endpoints Expostos

- `POST /storage/upload` — Upload multipart com autenticação JWT.
- `GET /storage/arquivos/:subpasta/:nome` — Recuperação segura de arquivos.

### 9.3 Regras de Negócio e Decisões de Projeto

1. **Padrão Adapter (`StorageServiceBase`):** Desacoplamento entre interface abstrata e implementação concreta (`LocalStorageService`), facilitando a transição futura para provedores em nuvem (S3/GCS).
2. **Mitigação Crítica de Path Traversal (CWE-22):**
   - Bloqueio de sequências `..`, `%2e%2e` e bytes nulos `\0`.
   - Confinamento estrito: `caminho.startsWith(uploadDir + path.sep)`.
3. **Whitelist de Extensões e MIME Types (CWE-434):**
   - Aceita apenas formatos seguros (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.xls`, `.xlsx`).
   - Limite de tamanho de 15 MB.

### 9.4 Testes Unitários

- `storage.service.spec.ts`: Salvamento em disco, geração de nomes únicos e remoção de arquivos.
- `storage.controller.spec.ts`: Validação de tipos permitidos e bloqueio estrito contra tentativas de Path Traversal.

---

## 10. Módulo `comunicacao` (RF09 — Notificações e Avisos)

### 10.1 Finalidade e Escopo

Disparo de comunicados e notificações para participantes de edições ou atividades específicas.

### 10.2 Endpoints Expostos

- `POST /comunicacao/enviar` — Envio de novo comunicado (`EnviarComunicadoDto`).
- `GET /comunicacao/edicao/:id` — Consulta do histórico de comunicados da edição.
- `GET /comunicacao/minhas-notificacoes` — Listagem de notificações do participante autenticado (`@CurrentUser()`).

### 10.3 Regras de Negócio e Decisões de Projeto

1. **Segmentação de Público:** Suporte a filtros por público-alvo (`perfil_alvo`) ou por participantes de atividades específicas (`id_atividade`).
2. **Persistência em Lote sem N+1:** Substituição de inserções individuais em laço pela chamada em lote `prisma.notificacao.createMany`.
3. **Autorização:** Apenas organizadores e administradores possuem permissão para disparar comunicados.

### 10.4 Testes Unitários

- `comunicacao.service.spec.ts`: Criação do comunicado, filtragem correta de destinatários por atividade/perfil e criação em lote de notificações.

---

## 11. Módulo `inventario` (RF12 — Gestão de Itens e Retiradas)

### 11.1 Finalidade e Escopo

Controle de estoque e movimentação física de materiais e equipamentos utilizados na realização dos eventos acadêmicos.

### 11.2 Endpoints Expostos

- `POST /inventario/itens` — Cadastro de novo item no inventário (`CriarItemInventarioDto`).
- `GET /inventario/itens/edicao/:id_edicao` — Listagem de itens disponíveis para a edição.
- `POST /inventario/retirar` — Registro de retirada de itens (`RetirarItemDto`).
- `PATCH /inventario/devolver/:id` — Registro de devolução atômica de item retirado (`id_registro_item`).
- `GET /inventario/alertas/edicao/:id_edicao` — Consulta de alertas de estoque crítico (`quantidade_disponivel <= quantidade_minima`).
- `GET /inventario/relatorio/edicao/:id_edicao` — Relatório consolidado de movimentações e saldo do inventário da edição.

### 11.3 Regras de Negócio e Decisões de Projeto

1. **Blindagem RBAC do Controller:** Todo o `InventarioController` é protegido em nível de classe com `JwtAuthGuard`, `RolesGuard` e `@Roles('organizador', 'administrador')`.
2. **Prevenção de IDOR:** O organizador solicitante da retirada é obtido pelo token JWT (`idUsuario`). Qualquer divergência com o campo `id_organizador` do corpo resulta em `403 Forbidden`.
3. **Atomicidade e Lock Pessimista na Retirada:** A baixa de estoque é efetuada através da procedure `sp_retirar_inventario` com `SELECT ... FOR UPDATE`, impedindo estoque negativo em concorrência.
4. **Prevenção de Devolução Duplicada (Double-Return):** O método `devolverItem` executa transação com `tx.registroInventario.updateMany` condicional filtrando `status: 'Retirado'`. Se `count === 0` (o item já foi devolvido concorrentemente), a transação é abortada com `400 Bad Request`. Caso contrário, a quantidade é creditada atomicamente via `increment: registro.quantidade_retirada` em `ItemInventarioFisico`, anulando riscos de concorrência e inconsistência de saldo.

### 11.4 Testes Unitários

- `inventario.service.spec.ts`: Cadastro de item, bloqueio de retiradas em nome de outro organizador, validação de sucesso com débito correto, devolução atômica com bloqueio de double-return, alertas de estoque e emissão de relatórios.

---

## 12. Módulo `submissoes` (RF06 — Avaliações de Trabalhos e Blind Review)

### 12.1 Finalidade e Escopo

Gerencia o fluxo de avaliação de artigos e trabalhos acadêmicos submetidos aos eventos.

### 12.2 Endpoints Expostos

- `POST /submissoes/avaliacoes` — Registro de parecer e nota de trabalho acadêmico (`RegistrarAvaliacaoDto`).

### 12.3 Regras de Negócio e Decisões de Projeto

1. **Identificação do Parecerista pelo JWT:** O parecerista é identificado pelo `id_usuario` do token; divergência com o corpo gera `403 Forbidden`.
2. **Integridade de Blind Review:** O sistema valida que o parecerista não seja autor ou coautor do trabalho avaliado (`submissao.autor.id_usuario === parecerista.id_usuario`), prevenindo conflito de interesses.
3. **Atomicidade:** Registro persistido via stored procedure `sp_registrar_avaliacao_trabalho`.

### 12.4 Testes Unitários

- `submissoes.service.spec.ts`: Avaliação válida, bloqueio de autoavaliação (conflito de interesse) e rejeição de parecerista divergente.

---

## 13. Módulo `logs` (RF16 — Auditoria e Rastreabilidade)

### 13.1 Finalidade e Escopo

Auditoria e observabilidade de ações mutatórias realizadas no sistema.

### 13.2 Endpoints e Componentes Expostos

- `LoggingInterceptor` — Interceptor global que audita requisições mutatórias (`POST`, `PUT`, `PATCH`, `DELETE`).
- `GET /admin/logs` — Consulta de registros recentes de auditoria (`ListarLogsDto`), agrupado no Swagger sob a tag `@ApiTags('admin')`.

### 13.3 Regras de Negócio e Decisões de Projeto

1. **Despacho Assíncrono:** Execução sob `setImmediate()` para não onerar o tempo de resposta da API.
2. **Buffer Circular em Memória (Marco P3):** Fila FIFO em memória com teto de 500 registros.
3. **Transição para NoSQL (Marco P4):** Arquitetura desacoplada via Adapter para futura persistência em MongoDB ou Redis Stream/Document.
4. **Controle de Acesso:** Rota de auditoria restrita a usuários com perfil de `administrador`.
5. **Validação Estrita de Limite:** O parâmetro de consulta `limite` é validado defensivamente (`ListarLogsDto`); chamadas com limites `<= 0`, `> 500` ou não numéricos são rejeitadas com `400 Bad Request`. O serviço aplica clamping entre 1 e 500 (default 100).

### 13.4 Testes Unitários

- `logging.interceptor.spec.ts`: Interceptação exclusiva de métodos mutatórios, captura de usuário e despacho assíncrono.
- `logs.service.spec.ts`: Funcionamento do buffer circular e retenção do limite de logs.
- `logs.controller.spec.ts`: Acesso administrativo à listagem de auditoria e validações de paginação.

---

## 14. Módulo `prisma` (Persistência Relacional, Procedures e Conexões)

### 14.1 Finalidade e Escopo

Infraestrutura transversal de persistência de dados sobre PostgreSQL 17 utilizando Prisma ORM 6 com adapter `@prisma/adapter-pg`.

### 14.2 Componentes e Estrutura

- `PrismaModule` — Módulo global (`@Global()`) exportando a instância única de `PrismaService`.
- `PrismaService` — Gerenciador do ciclo de vida das conexões (`OnModuleInit` e `OnModuleDestroy`), configurado com `disposeExternalPool: true` e encerramento gracioso via `this.pool.end()`.
- `procedures.ts` — Invocações tipadas às 5 stored procedures nativas do banco via tagged templates parametrizados (`$queryRaw`):
  - `sp_retirar_inventario`: Baixa atômica de estoque com lock `FOR UPDATE`.
  - `sp_reservar_espaco`: Reserva de salas com detecção de colisão temporal e lock `FOR UPDATE`.
  - `sp_realizar_inscricao_edicao`: Venda concorrente de ingressos com bloqueio de lote.
  - `sp_registrar_avaliacao_trabalho`: Registro de nota e parecer de artigos acadêmicos.
  - `sp_emitir_certificado_atividade`: Geração de certificado vinculada à frequência real.
- `map-procedure-error.ts` — Interceptador de erros de procedures SQL, convertendo exceções nativas em `ConflictException` (conflitos de reserva) ou `BadRequestException` com mensagens amigáveis.

### 14.3 Testes Unitários

- `prisma.service.spec.ts`: Validação de ciclo de vida e encerramento de conexões.
- `map-procedure-error.spec.ts`: Cobertura de mapeamento semântico de erros de banco.

---

## 15. Matriz de Cobertura de Testes Automatizados

O backend conta com **160 testes unitários automatizados** distribuídos em **22 suítes de teste Jest**, cobrindo 100% dos módulos descritos:

```text
PASS src/logs/logging.interceptor.spec.ts
PASS src/auth/guards/roles.guard.spec.ts
PASS src/logs/logs.service.spec.ts
PASS src/eventos/eventos.service.spec.ts
PASS src/inscricoes/inscricoes.service.spec.ts
PASS src/storage/storage.service.spec.ts
PASS src/prisma/map-procedure-error.spec.ts
PASS src/auth/strategies/jwt.strategy.spec.ts
PASS src/app.controller.spec.ts
PASS src/prisma/prisma.service.spec.ts
PASS src/logs/logs.controller.spec.ts
PASS src/storage/storage.controller.spec.ts
PASS src/espacos/espacos.service.spec.ts
PASS src/atividades/atividades.service.spec.ts
PASS src/auth/auth.service.spec.ts
PASS src/certificados/certificados.service.spec.ts
PASS src/submissoes/submissoes.service.spec.ts
PASS src/inventario/inventario.service.spec.ts
PASS src/pagamentos/pagamentos.service.spec.ts
PASS src/comunicacao/comunicacao.service.spec.ts
PASS src/espacos/espacos.controller.spec.ts
PASS src/inscricoes/inscricoes.controller.spec.ts

Test Suites: 22 passed, 22 total
Tests:       160 passed, 160 total
```

### Testes de Integração e Segurança Ponta a Ponta (e2e)

Além dos testes unitários, a suíte de segurança ponta a ponta (`npm run test:e2e`) valida **18 cenários de segurança e controle de acesso** distribuídos em **2 suítes**:

- `test/app.e2e-spec.ts` — Validação básica de saúde da API.
- `test/security.e2e-spec.ts` — Validação contra Path Traversal (`%2e%2e`), rejeição de uploads desautenticados, Broken Access Control (401 sem JWT, 401 sem secret de webhook, 403 para participante em `/admin/logs`, 200 para admin e validação de query parameters defensivos).

```text
PASS test/app.e2e-spec.ts
PASS test/security.e2e-spec.ts

Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
```
