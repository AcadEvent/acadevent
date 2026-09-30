# Relatório de testes — AcadEvent

Versão: 1.0
Data: 2026-09-30
Autor: Gerador automatizado (QA)
Revisores: —

---

Execução: 2026-09-30T03:53:12.494Z
Base Git: dcee761 (alterações locais podem estar presentes)
Ambiente: Node v22.19.0; win32

## Resultado

| Projeto | Situação | Suítes aprovadas/total | Testes aprovados | Falhos | Pendentes | Tempo (s) |
| --- | --- | --- | --- | --- | --- | --- |
| backend | APROVADO | 22/22 | 177 | 0 | 0 | 13.12 |
| frontend | APROVADO | 3/3 | 22 | 0 | 0 | 2.16 |

## Cobertura de código

Inclui arquivos de produção mesmo quando não possuem testes. Cobertura não comprova correção das regras de negócio.

| Projeto | Instruções (%) | Ramos (%) | Funções (%) | Linhas (%) |
| --- | --- | --- | --- | --- |
| backend | 82.78 | 71.44 | 68.57 | 82.27 |
| frontend | 47.96 | 34.63 | 37.11 | 49.55 |

## Escopo e limites

Jest executa testes unitários de serviços e clientes, além de testes HTTP isolados existentes com Supertest. Prisma, rede e dados de demonstração são simulados. As suítes backend/test/*.e2e-spec.ts não integram esta execução.

Não valida PostgreSQL real, procedures, concorrência no banco, serviços externos ou navegação no navegador. Módulos ainda não implementados não são certificados por este relatório. Consulte docs/modulo-testes.md para a matriz de requisitos e comandos.

## Casos executados

| Projeto | Arquivo | Cenário | Resultado |
| --- | --- | --- | --- |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosController - Segurança e Autenticação confirmarManual sem JWT retorna 401 | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosController - Segurança e Autenticação confirmarManual por usuário sem permissão retorna 403 | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosController - Segurança e Autenticação webhook sem segredo/assinatura retorna 401 | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosController - Segurança e Autenticação confirmarManual por organizador retorna 201 | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosController - Segurança e Autenticação webhook com segredo valido retorna 201 | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosController - Segurança e Autenticação webhook com o antigo segredo padrao do codigo retorna 401 | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosController - Segurança e Autenticação webhook retorna 401 quando WEBHOOK_SECRET nao esta configurado | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosService - processarWebhook e Idempotência webhook reemitido para pagamento já Aprovado não recria o hash do QR Code (idempotência) | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosService - processarWebhook e Idempotência processarWebhook aprova pagamento Pendente e gera QR code inicial | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosService - processarWebhook estorno e cancelamento processa estorno de pagamento ja Aprovado e marca a inscricao como Estornada | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosService - confirmarManual deve lançar NotFoundException se inscricao nao for encontrada | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosService - confirmarManual deve lançar BadRequestException se inscricao ja estiver Confirmada | passed |
| backend | backend/src/pagamentos/pagamentos.service.spec.ts | Pagamentos (Controller & Service) PagamentosService - gerarRelatorioFinanceiro deve calcular totais financeiros da edicao corretamente | passed |
| backend | backend/src/inscricoes/inscricoes.controller.spec.ts | InscricoesController - validar-qrcode (check-in) sem autenticacao retorna 401 e nao consome o QR Code | passed |
| backend | backend/src/inscricoes/inscricoes.controller.spec.ts | InscricoesController - validar-qrcode (check-in) participante retorna 403 e nao consome o QR Code | passed |
| backend | backend/src/inscricoes/inscricoes.controller.spec.ts | InscricoesController - validar-qrcode (check-in) organizador valida o QR Code (201) | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService emitirCertificadoAtividade deve lancar NotFoundException se a edicao nao existir | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService emitirCertificadoAtividade deve lancar NotFoundException se o usuario nao existir | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService emitirCertificadoAtividade deve chamar sp_emitir_certificado_atividade na transacao | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService emitirCertificadoAtividade deve gerar automaticamente codigo de autenticidade no servidor com formato AUTH-UUID | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService emitirCertificadoAtividade deve lancar ConflictException ao tentar emitir segundo certificado para mesmo usuario e atividade | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService validarCertificado deve lancar NotFoundException se certificado nao for encontrado | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService validarCertificado deve retornar informacoes do certificado valido | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService validarCertificado nao deve expor o e-mail completo do participante na validacao publica (LGPD) | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService gerarPdfCertificado deve gerar buffer de PDF para certificado valido | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService gerarPdfCertificado deve registrar a carga horaria real da atividade no PDF gerado | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService gerarPdfCertificado deve usar FRONTEND_URL ou http://localhost:3001 (frontend) na URL de validacao impressa no PDF | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService CertificadosController - emitirCertificadoAtividade participante sem id_usuario no corpo emite o proprio certificado | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService CertificadosController - emitirCertificadoAtividade participante emitindo para outro usuario lanca ForbiddenException | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService CertificadosController - emitirCertificadoAtividade organizador pode emitir certificado para outro usuario | passed |
| backend | backend/src/certificados/certificados.service.spec.ts | CertificadosService CertificadosController - downloadCertificado deve sanitizar codigo com aspas ou caracteres ilegais no header Content-Disposition | passed |
| backend | backend/src/auth/auth.service.spec.ts | AuthService cadastrar deve lancar BadRequestException se o email ja estiver em uso | passed |
| backend | backend/src/auth/auth.service.spec.ts | AuthService cadastrar deve lancar BadRequestException amigavel quando ocorrer erro de unicidade P2002 no banco sob concorrencia | passed |
| backend | backend/src/auth/auth.service.spec.ts | AuthService cadastrar deve rejeitar cadastro com BadRequestException se o nome contiver apenas espacos | passed |
| backend | backend/src/auth/auth.service.spec.ts | AuthService cadastrar deve criar novo usuario com perfil participante e retornar token | passed |
| backend | backend/src/auth/auth.service.spec.ts | AuthService login deve lancar UnauthorizedException se usuario nao existir | passed |
| backend | backend/src/auth/auth.service.spec.ts | AuthService login deve lancar UnauthorizedException se a senha for incorreta | passed |
| backend | backend/src/auth/auth.service.spec.ts | AuthService login deve realizar login com sucesso se as credenciais estiverem corretas | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) SubmissoesController - Autenticação e Autorização avaliar trabalho sem JWT retorna 401 | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) SubmissoesController - Autenticação e Autorização avaliar trabalho por participante retorna 403 | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) SubmissoesController - Autenticação e Autorização avaliar trabalho por parecerista retorna 201 | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) SubmissoesController - Autenticação e Autorização avaliar trabalho por organizador sem perfil de parecerista retorna 403 | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) registrarAvaliacao deve lançar NotFoundException se o trabalho nao existir | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) registrarAvaliacao deve lançar ForbiddenException se o usuario autenticado nao for parecerista | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) registrarAvaliacao deve lançar ForbiddenException ao avaliar em nome de outro parecerista | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) registrarAvaliacao autor avaliando o próprio artigo lança ForbiddenException (conflito de interesses / blind review) | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) registrarAvaliacao deve chamar sp_registrar_avaliacao_trabalho na transacao quando parecerista nao for autor | passed |
| backend | backend/src/submissoes/submissoes.service.spec.ts | Submissoes (Controller & Service) registrarAvaliacao usa o parecerista do token quando id_parecerista nao e enviado | passed |
| backend | backend/src/espacos/espacos.controller.spec.ts | EspacosController - Autorizacao por papel participante nao pode criar espaco (403) | passed |
| backend | backend/src/espacos/espacos.controller.spec.ts | EspacosController - Autorizacao por papel participante nao pode reservar espaco (403) | passed |
| backend | backend/src/espacos/espacos.controller.spec.ts | EspacosController - Autorizacao por papel organizador pode criar espaco (201) | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) InventarioController - Autenticação e Autorização retirarItem sem JWT retorna 401 | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) InventarioController - Autenticação e Autorização retirarItem por participante retorna 403 | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) InventarioController - Autenticação e Autorização retirarItem por organizador autenticado retorna 201 | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) retirarItem deve lançar NotFoundException se o item nao existir | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) retirarItem deve lançar ForbiddenException se o usuario autenticado nao for organizador | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) retirarItem deve lançar ForbiddenException ao registrar retirada em nome de outro organizador | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) retirarItem deve chamar sp_retirar_inventario na transacao | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) devolverItem deve lançar NotFoundException se o registro nao existir | passed |
| backend | backend/src/inventario/inventario.service.spec.ts | Inventario (Controller & Service) devolverItem devolverItem concorrente impede double-return (incremento duplicado do estoque) | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve lançar NotFoundException se atividade não existir | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve lançar ForbiddenException se participante não for encontrado | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve lançar ForbiddenException se inscrição no evento não estiver Confirmada | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve lançar BadRequestException se lotação do espaço físico for atingida | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve efetuar inscrição com sucesso se todas as regras forem atendidas | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve lançar BadRequestException se chamada for enviada com array vazio | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve registrar chamada em lote com sucesso | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService deve aceitar RegistrarPresencaDto estruturado sem lançar TypeError | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService não deve considerar inscrições canceladas ao verificar capacidade da atividade | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService não deve gerar conflito de horário com inscrições com status Cancelada | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05 - cadastro e associação de ministrante não persiste atividade quando a edição não existe | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05 - cadastro e associação de ministrante cadastra atividade na edição selecionada | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05 - cadastro e associação de ministrante não associa quando atividade não existe | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05 - cadastro e associação de ministrante não associa quando ministrante não existe | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05 - cadastro e associação de ministrante associa ministrante existente à atividade | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.3 - inscrição e limites de horário rejeita inscrição duplicada sem gravar | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.3 - inscrição e limites de horário rejeita sobreposição parcial sem gravar | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.3 - inscrição e limites de horário rejeita atividade contida sem gravar | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.3 - inscrição e limites de horário rejeita mesmo horário sem gravar | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.3 - inscrição e limites de horário permite horários consecutivos 08:00–10:00 | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.3 - inscrição e limites de horário permite horários consecutivos 12:00–14:00 | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.6 - autorização e integridade da chamada participante não pode registrar presença | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.6 - autorização e integridade da chamada perfilOrganizador pode registrar presença | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.6 - autorização e integridade da chamada perfilMinistrante pode registrar presença | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.6 - autorização e integridade da chamada perfilAdministrador pode registrar presença | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.6 - autorização e integridade da chamada rejeita status inválido sem gravar | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService RF05.6 - autorização e integridade da chamada não grava parcialmente quando uma inscrição do lote não existe | passed |
| backend | backend/src/atividades/atividades.service.spec.ts | AtividadesService AtividadesController - chamada sem JWT deve possuir JwtAuthGuard aplicado ao endpoint chamada | passed |
| backend | backend/src/comunicacao/comunicacao.service.spec.ts | Comunicacao (Controller & Service) ComunicacaoController - Autorização enviar comunicado por participante retorna 403 | passed |
| backend | backend/src/comunicacao/comunicacao.service.spec.ts | Comunicacao (Controller & Service) enviarComunicado deve lancar NotFoundException se a edicao nao existir | passed |
| backend | backend/src/comunicacao/comunicacao.service.spec.ts | Comunicacao (Controller & Service) enviarComunicado deve registrar comunicado com sucesso e disparar notificacoes | passed |
| backend | backend/src/comunicacao/comunicacao.service.spec.ts | Comunicacao (Controller & Service) enviarComunicado envio com id_atividade ou perfil_alvo filtra apenas os destinatários pretendidos | passed |
| backend | backend/src/comunicacao/comunicacao.service.spec.ts | Comunicacao (Controller & Service) listarPorEdicao deve retornar lista de comunicados ordenados por data | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Path Traversal em obterArquivo deve lancar ForbiddenException quando subpasta ou nome contiver ".." | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Path Traversal em obterArquivo deve lancar ForbiddenException quando subpasta ou nome contiver "%2e%2e" | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Path Traversal em obterArquivo deve lancar ForbiddenException para caminhos que resolvam fora de uploads/ | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Path Traversal em obterArquivo deve enviar arquivo se caminho for valido e existir | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Path Traversal em obterArquivo deve lancar NotFoundException se caminho for valido mas arquivo nao existir | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Autenticação de Upload (Upload anônimo) deve ter o guard JwtAuthGuard aplicado ao endpoint uploadArquivo | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Autenticação de Upload (Upload anônimo) deve bloquear upload anonimo (sem token JWT) retornando 401 Unauthorized | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Validação de Tipos de Arquivo no Upload deve rejeitar upload de arquivo .html com BadRequestException("Tipo de arquivo nao permitido.") | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Validação de Tipos de Arquivo no Upload deve rejeitar upload de arquivo .svg com scripts com BadRequestException("Tipo de arquivo nao permitido.") | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Validação de Tipos de Arquivo no Upload deve rejeitar upload de arquivo .exe com BadRequestException("Tipo de arquivo nao permitido.") | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Validação de Tipos de Arquivo no Upload deve rejeitar upload de arquivo .sh com BadRequestException("Tipo de arquivo nao permitido.") | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Validação de Tipos de Arquivo no Upload deve aceitar upload legítimo de arquivo .pdf | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Validação de Tipos de Arquivo no Upload deve aceitar upload legítimo de arquivo .png | passed |
| backend | backend/src/storage/storage.controller.spec.ts | StorageController Validação de Tipos de Arquivo no Upload deve aceitar upload legítimo de arquivo .jpg | passed |
| backend | backend/src/logs/logs.controller.spec.ts | LogsController deve repassar o limite informado para logsService.listarRecentes | passed |
| backend | backend/src/logs/logs.controller.spec.ts | LogsController deve usar o limite padrao (100) quando query.limite for indefinido | passed |
| backend | backend/src/logs/logs.controller.spec.ts | LogsController deve usar o limite padrao (100) quando query for vazia ou undefined | passed |
| backend | backend/src/logs/logs.controller.spec.ts | LogsController deve aplicar clamping ao teto de 500 se o limite exceder | passed |
| backend | backend/src/logs/logs.controller.spec.ts | LogsController deve aplicar clamping ao piso de 1 se o limite for menor que 1 | passed |
| backend | backend/src/logs/logs.controller.spec.ts | LogsController deve aplicar clamping ao piso de 1 se o limite for 0 | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosService reservarEspaco deve lançar BadRequestException se a data final nao for posterior | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosService reservarEspaco deve lançar NotFoundException se o espaco nao existir | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosService reservarEspaco deve lançar BadRequestException se o espaco e a atividade pertencerem a edicoes diferentes | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosService reservarEspaco deve lançar BadRequestException se horario de inicio da reserva for anterior ao inicio da atividade | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosService reservarEspaco deve lançar BadRequestException se horario final da reserva for posterior ao termino da atividade | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosService reservarEspaco deve lançar BadRequestException se horario da reserva estiver fora do intervalo do evento (edicao) | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosService reservarEspaco deve chamar sp_reservar_espaco na transacao | passed |
| backend | backend/src/espacos/espacos.service.spec.ts | EspacosController - Autenticação e Autorização deve ter JwtAuthGuard e RolesGuard aplicados na classe EspacosController | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService listarPublicos deve retornar lista de eventos publicados | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService buscarPorSlug deve retornar detalhes da edicao quando encontrada pela sigla | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService buscarPorSlug deve lancar NotFoundException se o evento nao for encontrado | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService buscarPorSlug nao deve incluir cupons na consulta nem retornar cupons na resposta publica | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService criarEvento deve lancar BadRequestException se data de encerramento for anterior a de abertura | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService criarEvento deve criar evento gerando slug conforme Contrato v1 (sigla original preservada e slug kebab-case) | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService criarEvento deve adicionar sufixo -2 se o slug gerado ja existir no banco | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService criarEvento deve aceitar slug quando sigla nao for explicitamente informada | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService atualizarStatus deve lancar ForbiddenException se usuario nao for organizador do evento nem admin (IDOR) | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService atualizarStatus deve permitir atualizarStatus se usuario for admin | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService atualizarStatus deve permitir atualizarStatus se usuario for o organizador do evento | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService atualizarStatus deve lancar BadRequestException em transicao invalida de Encerrado para Publicado | passed |
| backend | backend/src/eventos/eventos.service.spec.ts | EventosService atualizarStatus deve lancar BadRequestException em transicao invalida de Encerrado para Rascunho | passed |
| backend | backend/src/app.controller.spec.ts | AppController root should return "Hello World!" | passed |
| backend | backend/src/storage/storage.service.spec.ts | LocalStorageService deve salvar arquivo e retornar metadados com url relativa | passed |
| backend | backend/src/storage/storage.service.spec.ts | LocalStorageService deve excluir arquivo se ele existir no disco | passed |
| backend | backend/src/storage/storage.service.spec.ts | LocalStorageService deve lancar ForbiddenException ao tentar excluir arquivo com caminho contendo ".." e nunca excluir arquivos fora de uploads/ | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService criarInscricao deve lançar NotFoundException se lote não for encontrado | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService criarInscricao deve lançar BadRequestException se lote estiver fechado (antes da abertura) | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService criarInscricao deve lançar BadRequestException se o lote estiver esgotado na rotina SQL | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService criarInscricao deve criar inscricao com sucesso sem cupom via sp_realizar_inscricao_edicao | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService criarInscricao deve lançar BadRequestException se cupom for de outra edicao | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService criarInscricao deve confirmar automaticamente a inscricao com cupom de 100% de desconto e marcar pagamento como Aprovado | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService validarQrCode deve validar e credenciar na primeira vez, e lançar BadRequestException por replay attack na segunda vez | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService validarQrCode não deve retornar o campo senha_hash ao validar QR Code | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService processarWebhook deve lançar NotFoundException se pagamento não for encontrado | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService processarWebhook deve processar status Aprovado e atualizar tabelas via transaction | passed |
| backend | backend/src/inscricoes/inscricoes.service.spec.ts | InscricoesService processarWebhook deve apenas atualizar pagamento se status diferente de Aprovado | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve registrar requisicao mutatoria com metodo POST | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve registrar requisicao mutatoria com metodo PUT | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve registrar requisicao mutatoria com metodo PATCH | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve registrar requisicao mutatoria com metodo DELETE | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve normalizar metodo em caixa baixa para caixa alta ao auditar | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve registrar requisicao mutatoria sem usuario autenticado (request.user indefinido) | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor nao deve registrar requisicoes somente de leitura (GET) | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve auditar requisicao mutatoria que falha com HttpException e propagar o erro | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve auditar requisicao mutatoria que falha com Error generico usando status 500 e propagar o erro | passed |
| backend | backend/src/logs/logging.interceptor.spec.ts | LoggingInterceptor deve usar response.statusCode quando erro nao e HttpException e response.statusCode >= 400 | passed |
| backend | backend/src/prisma/prisma.service.spec.ts | PrismaService deve chamar $disconnect e pool.end no onModuleDestroy para prevenir vazamento de conexoes | passed |
| backend | backend/src/logs/logs.service.spec.ts | LogsService deve registrar log assincronamente e permitir listagem | passed |
| backend | backend/src/logs/logs.service.spec.ts | LogsService deve respeitar a capacidade maxima do buffer circular (500) e descartar os registros mais antigos ao transbordar | passed |
| backend | backend/src/logs/logs.service.spec.ts | LogsService deve capturar erro e registrar no logger.error se ocorrer falha no setImmediate | passed |
| backend | backend/src/auth/strategies/jwt.strategy.spec.ts | JwtStrategy deve lancar Error fatal no startup se JWT_SECRET nao estiver definido | passed |
| backend | backend/src/auth/strategies/jwt.strategy.spec.ts | JwtStrategy deve instanciar com sucesso quando JWT_SECRET estiver definido | passed |
| backend | backend/src/auth/strategies/jwt.strategy.spec.ts | JwtStrategy deve validar payload do JWT e mapear campos do usuario corretamente | passed |
| backend | backend/src/prisma/map-procedure-error.spec.ts | mapProcedureError converte conflito de reserva em ConflictException | passed |
| backend | backend/src/prisma/map-procedure-error.spec.ts | mapProcedureError converte demais Erro: em BadRequestException | passed |
| backend | backend/src/prisma/map-procedure-error.spec.ts | mapProcedureError repassa erros sem prefixo Erro: | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve permitir acesso se a rota nao tiver decorator @Roles | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve lancar UnauthorizedException se a rota exigir @Roles e o usuario for indefinido/nulo (sem fail-open) | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve retornar false sem quebrar em TypeError se user.perfis for uma string simples | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve retornar false sem quebrar em TypeError se user.perfis for um objeto | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve retornar false se user.perfis for null ou nao for array | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve permitir acesso se o usuario possuir o papel exigido | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve permitir acesso irrestrito se o usuario possuir o papel administrador | passed |
| backend | backend/src/auth/guards/roles.guard.spec.ts | RolesGuard deve negar acesso (retornar false) se o usuario nao tiver o papel exigido nem administrador | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados cronograma ordena horários de reservas e preserva privacidade do ministrante | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados falha de rede no cronograma não é apresentada como lista vazia | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados inscrição envia Bearer e identificador da atividade | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados conflito preserva código 409 e mensagem para o participante | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados resposta de erro não JSON preserva status HTTP | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados cadastro traduz os dados da interface para o contrato do backend | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados chamada envia presença e ausência no DTO estruturado | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados emissão para o usuário autenticado omite beneficiário quando não informado | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados não considera válido certificado sem dados: {"valido":false} | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados não considera válido certificado sem dados: {"valido":true,"certificado":null} | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados certificado inexistente retorna inválido | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados erro do servidor ao validar certificado é propagado | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados validação mapeia beneficiário, evento e carga horária | passed |
| frontend | frontend/src/lib/api/atividades.test.ts | RF05 / RF11 - contratos da API de atividades e certificados código com caracteres especiais é codificado nas URLs públicas | passed |
| frontend | frontend/src/app/(gerenciar)/gerenciar/[slug]/inscricoes/gestao.test.ts | gestão no mesmo mock confirmação atualiza a lista, o relatório e revalida as duas rotas | passed |
| frontend | frontend/src/app/(gerenciar)/gerenciar/[slug]/inscricoes/gestao.test.ts | gestão no mesmo mock check-in de pendente só passa depois da confirmação e recusa repetição | passed |
| frontend | frontend/src/app/(gerenciar)/gerenciar/[slug]/inscricoes/gestao.test.ts | gestão no mesmo mock rejeita código inexistente e a segunda entrada de um código já confirmado | passed |
| frontend | frontend/src/app/(gerenciar)/gerenciar/[slug]/inscricoes/gestao.test.ts | gestão no mesmo mock id ausente rejeita a confirmação sem revalidar | passed |
| frontend | frontend/src/app/(gerenciar)/gerenciar/[slug]/inscricoes/gestao.test.ts | clientes chamam as actions a tabela e o formulário não importam as mutações de @/lib/api | passed |
| frontend | frontend/src/lib/datas.test.ts | RF05.2 - horários apresentados no cronograma preserva horário cadastrado em UTC mesmo perto da virada do dia | passed |
| frontend | frontend/src/lib/datas.test.ts | RF05.2 - horários apresentados no cronograma formata intervalo e permite horário final ausente | passed |
| frontend | frontend/src/lib/datas.test.ts | RF05.2 - horários apresentados no cronograma dados ausentes não produzem datas ou horários fictícios | passed |

## Falhas e erros de execução

Nenhuma falha registrada.
