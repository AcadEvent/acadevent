# Documento de Requisitos: AcadEvent

**Versão**: 2.0  
**Data**: 2026-03-17  
**Autor**: José Carlos da Silva Filho (SPM)  
**Revisores**: Guilherme Zanan Piveta (SFE), João Vitor Antunes da Silva (SPM)  
**Disciplina**: TC-II - Prof. Dr. Cleber Mira

---

## Sumário Executivo

O AcadEvent é um sistema de informação distribuído para gerenciamento completo de eventos acadêmicos universitários. O problema central é a complexidade e fragmentação na gestão informacional de conferências e eventos: inscrições manuais, alocação de espaços sem controle de conflitos, emissão manual de certificados e comunicação descentralizada resultam em ineficiência para a comissão organizadora e experiência ruim para os participantes.

A solução proposta é uma plataforma web totalmente responsiva para desktop e mobile, construída sobre uma arquitetura MVC distribuída em 3 camadas (Next.js + NestJS + PostgreSQL), cobrindo todo o ciclo de vida de um evento — do cadastro à certificação — com módulos bônus de IA e web services RESTful.

O sistema é de **acesso público**: qualquer pessoa pode visualizar eventos sem autenticação. O cadastro e login desbloqueiam funcionalidades específicas por perfil.

---

## Perfis de Usuário e Permissões de Acesso

| Perfil                          | Descrição                                                | Nível de Acesso                                                                                           |
|---------------------------------|----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| **Visitante (não autenticado)** | Qualquer pessoa acessando o sistema                      | Visualização pública de eventos, cronograma e informações gerais                                          |
| **Visitante (autenticado)**     | Qualquer pessoa autenticada                              | Visualização pública de eventos, cronograma e informações gerais, inscrição em atividades, painel pessoal |
| **Participante**                | Qualquer pessoa autenticada que inscreve-se em um evento | Inscrição em atividades, certificados, pagamentos                                                         |
| **Ministrante / Palestrante**   | Condutores de atividades                                 | Gerenciamento das próprias atividades, upload de materiais, certificados                                  |
| **Patrocinador**                | Empresas parceiras do evento                             | Visualização de dados de visibilidade, gestão de perfil de patrocínio                                     |
| **Organizador / Comissão**      | Membros da equipe do evento                              | Gestão completa do evento: atividades, espaços, inscrições, relatórios                                    |
| **Administrador do Sistema**    | Equipe técnica da plataforma                             | Acesso irrestrito, configuração de múltiplos eventos, gestão de usuários                                  |

---

## Requisitos Funcionais

Os requisitos estão classificados por prioridade:
- **Must Have (MH)**: obrigatório para entrega e funcionamento básico do sistema
- **Should Have (SH)**: importante, deve ser incluído se possível
- **Could Have (CH)**: bônus ou enriquecimento do projeto

---

### RF01 — Gestão de Eventos e Páginas Públlicas

#### RF01.1 — Dados Cadastrais do Evento

| ID       | Requisito                                                                                                                                              | Prioridade |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF01.1.1 | O sistema deve permitir o cadastro de múltiplos eventos simultâneos com nome completo, sigla e número de edição                                        | MH         |
| RF01.1.2 | O sistema deve permitir o registro da instituição ou unidade universitária promotora do evento incluindo nome, campus, departamento ou curso vinculado | MH         |
| RF01.1.3 | O sistema deve permitir o cadastro de descrição geral do evento, área temática e público-alvo                                                          | MH         |
| RF01.1.4 | O sistema deve permitir o upload de logotipo e elementos de identidade visual do evento                                                                | MH         |
| RF01.1.5 | O sistema deve permitir o cadastro do local geral de realização do evento (endereço, campus, cidade, estado)                                           | MH         |
| RF01.1.6 | O sistema deve permitir o registro de site oficial e redes sociais do evento                                                                           | SH         |

#### RF01.2 — Períodos e Prazos

| ID       | Requisito                                                                                                                            | Prioridade |
|----------|--------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF01.2.1 | O sistema deve permitir a definição das datas e horários de início e encerramento do evento                                          | MH         |
| RF01.2.2 | O sistema deve permitir a configuração de um período de inscrição, com data/hora de abertura e encerramento                          | MH         |
| RF01.2.3 | O sistema deve permitir a configuração de um período de submissão de trabalhos                                                       | MH         |
| RF01.2.4 | O sistema deve encerrar automaticamente as inscrições ao atingir a capacidade máxima de participantes, mesmo antes do prazo definido | MH         |
| RF01.2.5 | O sistema deve exibir contagem regressiva para abertura de inscrições quando o período ainda não iniciou                             | SH         |

#### RF01.3 — Configurações Operacionais

| ID       | Requisito                                                                                                                                  | Prioridade |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF01.3.1 | O organizador deve poder definir a capacidade máxima de participantes por evento                                                           | MH         |
| RF01.3.2 | O organizador deve poder ativar ou desativar módulos do sistema por evento (ex: submissão de trabalhos, patrocinadores, galeria de mídias) | MH         |
| RF01.3.3 | O sistema deve controlar o status do evento com os estados: rascunho, publicado, em andamento, encerrado e arquivado                       | MH         |
| RF01.3.4 | O organizador deve poder definir quais perfis de usuário podem se inscrever no evento (ex: apenas alunos da instituição, público geral)    | SH         |
| RF01.3.5 | O sistema deve permitir a definição de múltiplas edições de um mesmo evento, mantendo histórico das edições anteriores                     | SH         |
| RF01.3.6 | O administrador deve poder arquivar ou excluir eventos                                                                                     | MH         |

#### RF01.4 — Configurações de Certificação

| ID       | Requisito                                                                                                                  | Prioridade |
|----------|----------------------------------------------------------------------------------------------------------------------------|------------|
| RF01.4.1 | O organizador deve poder configurar a carga horária mínima exigida para emissão de certificado ao participante, por evento | MH         |
| RF01.4.2 | O organizador deve poder definir o template visual do certificado associado ao evento                                      | MH         |
| RF01.4.3 | O organizador deve poder cadastrar os signatários do certificado com nome, cargo e assinatura digital (imagem)             | MH         |
| RF01.4.4 | O organizador deve poder configurar o texto institucional padrão que constará nos certificados do evento                   | MH         |

#### RF01.5 — Página Pública do Evento

| ID       | Requisito                                                                                                                                  | Prioridade |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF01.5.1 | O sistema deve gerar automaticamente uma página pública para cada evento publicado, acessível por uma URL, sem necessidade de autenticação | MH         |
| RF01.5.2 | A página pública deve exibir as informações cadastrais do evento, cronograma, lista de atividades, ministrantes e patrocinadores           | MH         |
| RF01.5.3 | A página pública deve exibir um botão de inscrição com indicação do status atual (inscrições abertas, encerradas ou esgotadas)             | MH         |
| RF01.5.4 | A página pública deve exibir os materiais de divulgação (banners e flyers) cadastrados pelo organizador                                    | SH         |

---

### RF02 — Gestão de Pessoas e Acessos

### RF02.1 - Autenticação e Controle de Acesso
| ID       | Requisito                                                                                                                                          | Prioridade |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF02.1.1 | O sistema deve permitir o cadastro de usuários com e-mail e senha                                                                                  | MH         |
| RF02.1.2 | O sistema deve implementar controle de acesso por perfil (RBAC) com os perfis de usuário definidos, com verifiação em todas as rotas protegidas    | MH         |
| RF02.1.3 | O administrador da plataforma deve poder alterar o perfil de acesso de qualquer usuário ou excluir contas                                          | MH         |
| RF02.1.4 | O sistema deve permitir recuperação de senha via e-mail                                                                                            | SH         |

### RF02.2 Pessoas e Papéis Vinculados a um Evento 
| ID        | Requisito                                                                                                                                                                     | Prioridade |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF02.2.1  | O organizador deve poder cadastrar grupos de trabalho da organização e associar membros da comissão a eles, com definição de função de cada membro                            | MH         |
| RF02.2.2  | O sistema deve permitir o cadastro de patrocinadores com razão social, logo, descrição e nível de patrocínio                                                                  | MH         |
| RF02.2.3  | O organizador deve poder convidar ou cadastrar ministrantes no evento                                                                                                         | MH         |
| RF02.2.4  | O ministrate deve ser capaz de incluir por evento seus dados profissionais nome, biografia, área de atuação, instituição de origem e foto                                     | MH         |
| RF02.2.5  | Os dados profissionais de cada ministrante devem ser visíveis na lista de ministrantes do evento                                                                              | MH         | 
| RF02.2.6  | O organizador deve poder cadastrar turnos de trabalho para cada membro da comissão, com data, horário de início, horário de término, função desempenhada e grupo de trabalho. | MH         |
| RF02.2.7  | O sistema deve calcular automaticamente a carga horária total acumulada por cada membro com base nos turnos cadastrados.                                                      | MH         |
| RF02.2.8  | O membro da organização deve poder confirmar ou registrar a sua presença em um turno, mediante validação pelo organizador responsável                                         | MH         |
| RF02.2.10 | O organizador deve poder detectar e ser alertado sobre conflitos de escala, como o mesmo membro alocado em dois turnos simultâneos                                            | MH         |
| RF02.2.11 | O sistema deve utilizar os dados de escala confirmados como base para a emissão de certificados dos membros da organização                                                    | MH         |
| RF02.2.12 | O organizador deve poder gerar relatório de escala por membro, por grupo de trabalho e por período do evento                                                                  | MH         |

### RF03 — Paineis

### RF03.1 - Painél do Participante
| ID       | Requisito                                                                                                                             | Prioridade |
|----------|---------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF03.1.1 | O sistema deve disponibilizar ao usuário um painel pessoal para cada evento com visão sobre as suas ações                             | MH         |
| RF03.1.2 | O painel deve exibir o histórico de inscrições e status de pagamentos                                                                 | MH         |
| RF03.1.3 | O painel deve permitir o download de recibos de pagamento                                                                             | MH         |
| RF03.1.4 | O painel deve permitir o download de certificados após o encerramento do evento, desde que cumpridos os critérios mínimos de presença | MH         |
| RF03.1.5 | O participante deve receber notificações sobre alterações nas atividades inscritas                                                    | SH         |
| RF03.1.6 | O participante deve poder visualizar sua grade personalizada com as atividades inscritas naquele evento                               | MH         |
| RF03.1.7 | O participante deve poder visualizar suas submissoẽs ao evento                                                                        | MH         |
 
### RF03.2 - Painél de Organizador
| ID       | Requisito                                                                                            | Prioridade |
|----------|------------------------------------------------------------------------------------------------------|------------|
| RF03.2.1 | O sistema deve disponibilizar aos organizadores de um evento um painel com visão sobre as suas ações | MH         |
| RF03.2.2 | O painel deve permitir incluir ou excluir módulos do evento                                          | MH         |
| RF03.2.3 | O painel deve permitir o incluir opções de inscrições                                                | MH         |
| RF03.2.4 | O painel deve permitir o gerenciar submissões                                                        | MH         |
| RF03.2.5 | O painel deve permitir visualizar a página do evento independente do status do evento                | MH         |
| RF03.2.6 | O painel deve permitir configurar certificados do evento                                             | MH         |
| RF03.2.7 | O painel deve permitir gerenciar as vendas do evento                                                 | MH         |
| RF03.2.8 | O painel deve permitir gerenciar as pessoas no evento                                                | MH         |
| RF03.2.9 | O painel deve permitir gerenciar as atividades do evento                                             | MH         |

---

### RF04 — Faturamento e Inscrições

| ID     | Requisito                                                                                                                                          | Prioridade |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF04.1 | O sistema deve permitir ao organizador gerenciar as inscrições de um evento, podendo definir elas como gratuitas ou pagas                          | MH         |
| RF04.2 | O sistema deve permitir ao organizador criar lotes de ingressos com preço, quantidade limitada e período de validade de cada lote                  | MH         |
| RF04.3 | O sistema deve permitir ao organizador criar cupons de desconto (percentual ou valor fixo) com limite de uso e período de validade                 | SH         |
| RF04.4 | O sistema deve registrar e controlar o status de pagamento de cada inscrição: pendente, confirmado, cancelado e estornado                          | MH         |
| RF04.5 | O sistema deve suportar registro manual de confirmação de pagamento pelo organizador para eventos sem gateway integrado                            | MH         |
| RF04.6 | O sistema deve gerar recibos de pagamento automaticamente após confirmação                                                                         | MH         |
| RF04.7 | O organizador deve poder visualizar relatório financeiro consolidado por evento                                                                    | MH         |
| RF04.8 | O sistema deve implementar QR Codes dinâmicos para validação de check-in na portaria                                                               | SH         |
| RF04.9 | O sistema deve implementar mecanismos para evitar automações maliciosas na compra de ingressos (CAPTCHA, tokens únicos por sessão e rate limiting) | SH         |
 
---

### RF05 — Gestão de Atividades e Cronograma

| ID     | Requisito                                                                                                                                                                                                                                                                           | Prioridade |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF05.1 | O organizador deve poder cadastrar atividades do evento (palestras, minicursos, mesas-redondas, workshops, mostras de trabalho, maratonas de programação, entre outros) com título, descrição, tipo, data, horário de início, horário de término, carga horária, local e capacidade | MH         |
| RF05.2 | O sistema deve exibir o cronograma completo do evento de forma pública, organizado por dia e por sala/espaço                                                                                                                                                                        | MH         |
| RF05.3 | O participante deve poder se inscrever em atividades dentro do evento, respeitando a capacidade máxima de cada atividade                                                                                                                                                            | MH         |
| RF05.4 | O sistema deve detectar e alertar sobre conflitos de horário na inscrição do participante em atividades                                                                                                                                                                             | SH         |
| RF05.5 | O organizador deve poder associar ministrantes a atividades específicas                                                                                                                                                                                                             | MH         |
| RF05.6 | O ministrante deve ser capaz de registrar a frequência e presença dos participantes nas suas atividade                                                                                                                                                                              | MH         | 
 
---

### RF06 — Submissões e Revisão de Trabalhos

| ID     | Requisito                                                                                                                                                                              | Prioridade |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF06.1 | O sistema deve permitir que um autor (participantes ou ministrantes) submetam trabalhos científicos para eventos com título, resumo, área temática e arquivos PDF com o trabalho em si | MH         |
| RF06.2 | O organizador deve poder atribuir trabalhos submetidos a pareceristas (organizador)                                                                                                    | MH         |
| RF06.3 | O parecerista deve poder registrar sua avaliação e emitir parecer: aceito, rejeitado ou revisão necessária                                                                             | MH         |
| RF06.4 | O autor deve ser notificado por e-mail sobre o resultado da revisão do seu trabalho                                                                                                    | MH         |
| RF06.5 | O sistema deve controlar os prazos de submissão e revisão configurados no RF01.2.3                                                                                                     | SH         |
| RF06.6 | Os trabalhos aceitos devem ser publicados nos anais do evento, acessíveis publicamente                                                                                                 | SH         |
| RF06.7 | O organizador deve ser capaz de configurar regras de sumbissão para trabalhos (template de submissão, limitar palavras ou caracteres, número  de apresentadores, regras personalizadas) | MH         |
 
---

### RF07 — Alocação de Espaços Físicos

| ID     | Requisito                                                                                                                                                                                                 | Prioridade |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF07.1 | O sistema deve permitir ao organizador o cadastro de espaços físicos (salas, auditórios, laboratórios) com nome, capacidade máxima e recursos disponíveis (projetor, ar-condicionado, computadores, etc.) | MH         |
| RF07.2 | O organizador deve poder reservar espaços para atividades específicas                                                                                                                                     | MH         |
| RF07.3 | O sistema deve validar e impedir conflitos de horário, capacidade insuficiente e incompatibilidade de infraestrutura na reserva de espaços                                                                | MH         |
| RF07.4 | O organizador deve poder visualizar um mapa de ocupação dos espaços por período                                                                                                                           | SH         |
 
---

### RF08 — Gestão de Inventário e Insumos

| ID     | Requisito                                                                                                                                                                             | Prioridade |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF08.1 | O organizador deve poder cadastrar itens de inventário físico do evento, incluindo pastas, canetas, maletas, impressos e materiais eletrônicos, com descrição e quantidade disponível | MH         |
| RF08.2 | O sistema deve registrar a distribuição e baixa de itens durante o evento, com identificação do responsável (ministrante ou organizador) pela retirada                                | MH         |
| RF08.3 | O sistema deve alertar o organizador quando o estoque de um item atingir nível crítico configurável                                                                                   | SH         |
| RF08.4 | O organizador deve poder gerar relatório de inventário por evento com situação atual de cada item                                                                                     | SH         |
 
---

### RF09 — Comunicação

| ID     | Requisito                                                                                                                                                                                                                       | Prioridade |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF09.1 | O sistema deve enviar e-mails automáticos para participantes com confirmação de inscrição e confirmação de pagamento, utilizando provedor de e-mail transacional configurável (SMTP ou serviço externo como Resend ou SendGrid) | MH         |
| RF09.2 | O organizador deve poder enviar comunicados gerais para todos os participantes de um evento                                                                                                                                     | MH         |
| RF09.3 | O organizador deve poder segmentar comunicados por perfil de usuário (ex: apenas ministrantes, apenas participantes de uma atividade específica)                                                                                | SH         |
| RF09.4 | O sistema deve enviar notificações automáticas para participantes em caso de alteração de horário, local ou cancelamento de uma atividade inscrita                                                                              | SH         |
| RF09.5 | O sistema deve enviar notificações para usuários do aplicativo móvel                                                                                                                                                            | SH         |
 
---

### RF10 — Repositório de Conteúdo Digital

| ID     | Requisito                                                                                                                                               | Prioridade |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF10.1 | O organizador deve poder fazer upload de materiais eletrônicos (PDFs, vídeos, tutoriais, slides) associados a atividades específicas ou ao evento geral | MH         |
| RF10.2 | O minstrante pode fazer upload de materiais eletrônicos nas atividades que é responsável                                                                | MH         |
| RF10.3 | Os participantes inscritos em uma atividade devem poder visualizar os materiais dessa atividade                                                         | MH         |
 
---

### RF11 — Certificação Automatizada e Auditoria

| ID     | Requisito                                                                                                                                                                                            | Prioridade |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF11.1 | O sistema deve emitir certificados automaticamente para participantes que cumprirem a carga horária mínima configurada no evento (RF01.4.1), com base no registro de presença por atividade (RF05.6) | MH         |
| RF11.2 | O sistema deve emitir certificados para ministrantes com base nas atividades conduzidas e registradas no sistema                                                                                     | MH         |
| RF11.3 | O sistema deve emitir certificados para membros da comissão organizadora com base na escala de trabalho registrada                                                                                   | MH         |
| RF11.4 | O sistema deve emitir certificados para técnicos apoiadores com base na função e período de atuação registrados                                                                                      | MH         |
| RF11.5 | Os certificados devem ser gerados em formato PDF com o template, texto institucional e assinaturas configurados pelo organizador (RF01.4)                                                            | MH         |
| RF11.6 | O sistema deve manter registro auditável de todos os certificados emitidos, com data, hora e identificação do beneficiário                                                                           | SH         |
| RF11.7 | O certificado deve conter código de autenticidade verificável, permitindo validação de sua autenticidade por terceiros                                                                               | SH         |
 
---

### RF12 — Gestão de Divulgação

| ID     | Requisito                                                                                                                                                                 | Prioridade |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RF12.1 | O organizador deve poder cadastrar mídias do evento (banners, flyers e posts para redes sociais) com associação a tipo e fase do evento (pré-evento, durante, pós-evento) | MH         |
| RF12.2 | O sistema deve disponibilizar uma galeria pública com fotos e mídias do evento                                                                                            | MH         |
| RF12.3 | O sistema deve permitir a exportação de materiais de divulgação em formatos e dimensões otimizados para as principais redes sociais (Instagram, LinkedIn e WhatsApp)      | SH         |
 
---

### RF13 — Gestão de Relatórios

| ID     | Requisito                                                                                                                         | Prioridade |
|--------|-----------------------------------------------------------------------------------------------------------------------------------|------------|
| RF13.1 | O organizador deve poder gerar relatório de inscritos por evento e por atividade, com filtros por perfil e status de pagamento    | MH         |
| RF13.2 | O organizador deve poder gerar relatório de pagamentos e situação financeira consolidada por evento                               | MH         |
| RF13.3 | O organizador deve poder gerar relatório de presença e frequência por atividade                                                   | MH         |
| RF13.4 | O organizador deve poder gerar relatório de submissões e revisões de trabalhos, com situação de cada submissão                    | MH         |
| RF13.5 | O organizador deve poder gerar relatório de alocação de espaços por período                                                       | SH         |
| RF13.6 | O organizador deve poder gerar relatório de inventário com movimentação e saldo de cada item                                      | SH         |
| RF13.7 | O organizador deve poder gerar relatório de certificados emitidos por perfil (participantes, ministrantes, organização, técnicos) | MH         |
| RF13.8 | O organizador deve poder gerar relatório de escala de trabalho dos membros da organização                                         | MH         |
| RF13.9 | Os relatórios devem ser exportáveis em PDF e CSV                                                                                  | SH         |
 
---

### RF14 — Web Services RESTful *(Bônus)*

| ID     | Requisito                                                                                                       | Prioridade |
|--------|-----------------------------------------------------------------------------------------------------------------|------------|
| RF14.1 | O sistema deve expor uma API REST pública (JSON) com informações do cronograma do evento                        | CH         |
| RF14.2 | A API deve disponibilizar endpoints para entidades públicas: eventos, atividades, ministrantes e patrocinadores | CH         |
| RF14.3 | A API deve seguir as convenções REST com documentação via Swagger/OpenAPI                                       | CH         |
 
---

### RF15 — Módulo de Recomendação via IA *(Bônus)*

| ID     | Requisito                                                                                       | Prioridade |
|--------|-------------------------------------------------------------------------------------------------|------------|
| RF15.1 | O sistema deve analisar o perfil e histórico do participante para sugerir atividades relevantes | CH         |
| RF15.2 | As sugestões devem ser exibidas no painel do participante e na tela de cronograma               | CH         |
 
---

### RF16 — Sistema de Log Assíncrono

| ID     | Requisito                                                                                                                | Prioridade |
|--------|--------------------------------------------------------------------------------------------------------------------------|------------|
| RF16.1 | O sistema deve registrar todas as interações dos módulos em um banco de dados não relacional (NoSQL) de forma assíncrona | SH         |
| RF16.2 | O log assíncrono não deve impactar o desempenho das transações no banco relacional principal                             | SH         |
| RF16.3 | O administrador deve poder consultar o log de atividades do sistema                                                      | SH         |

---

## Requisitos Não Funcionais

### RNF01 — Desempenho

| ID      | Requisito                                                                                                   | Prioridade |
|---------|-------------------------------------------------------------------------------------------------------------|------------|
| RNF01.1 | O tempo de resposta das páginas e chamadas de API deve ser inferior a 2 segundos sob carga normal           | MH         |
| RNF01.2 | O sistema deve suportar múltiplos eventos cadastrados e ativos simultaneamente sem degradação de desempenho | MH         |
| RNF01.3 | Operações de leitura não devem bloquear operações de escrita (garantido pelo MVCC do PostgreSQL)            | MH         |

---

### RNF02 — Disponibilidade e Confiabilidade

| ID      | Requisito                                                                                   | Prioridade |
|---------|---------------------------------------------------------------------------------------------|------------|
| RNF02.1 | O sistema deve estar disponível durante todo o período de realização de eventos cadastrados | MH         |
| RNF02.2 | Em caso de falha, o ambiente deve ser restaurado rapidamente via Docker                     | MH         |
| RNF02.3 | O sistema deve manter integridade referencial dos dados em todas as operações               | MH         |

---

### RNF03 — Segurança

| ID      | Requisito                                                                                                               | Prioridade |
|---------|-------------------------------------------------------------------------------------------------------------------------|------------|
| RNF03.1 | A autenticação deve ser realizada via e-mail e senha com senhas armazenadas com hash seguro (bcrypt)                    | MH         |
| RNF03.2 | O controle de acesso deve seguir o modelo RBAC (Role-Based Access Control) com verificação em todas as rotas protegidas | MH         |
| RNF03.3 | O sistema deve utilizar Prisma ORM para eliminar riscos de SQL Injection                                                | MH         |
| RNF03.4 | Toda a comunicação entre cliente e servidor deve ocorrer via HTTPS                                                      | MH         |
| RNF03.5 | Tokens de sessão devem ter prazo de expiração configurável                                                              | MH         |
| RNF03.6 | O sistema deve implementar mecanismo de QR Code dinâmico para validação de ingressos                                    | SH         |

---

### RNF04 — Usabilidade e Acessibilidade

| ID      | Requisito                                                                                     | Prioridade |
|---------|-----------------------------------------------------------------------------------------------|------------|
| RNF04.1 | O sistema web deve ser responsivo, funcionando adequadamente em dispositivos móveis e desktop | MH         |
| RNF04.2 | O sistema deve oferecer um aplicativo móvel nativo (iOS/Android) integrado à mesma API        | MH         |
| RNF04.3 | A interface deve apresentar mensagens de erro claras e orientadas ao usuário                  | MH         |
| RNF04.4 | O fluxo de inscrição em um evento deve ser concluído em no máximo 5 passos                    | SH         |

---

### RNF05 — Manutenibilidade e Portabilidade

| ID      | Requisito                                                                                                                                                                    | Prioridade |
|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RNF05.1 | O sistema deve ser conteinerizado com Docker, garantindo ambiente idêntico para todos os desenvolvedores                                                                     | MH         |
| RNF05.2 | O backend deve ser organizado por funcionalidade (Package by Feature) seguindo a arquitetura modular do NestJS                                                               | MH         |
| RNF05.3 | Alterações no esquema do banco de dados devem ser versionadas via Prisma Migrate                                                                                             | MH         |
| RNF05.4 | O módulo de armazenamento de arquivos deve usar o padrão Adapter, permitindo troca entre armazenamento local e Object Storage (S3/MinIO) sem refatoração da regra de negócio | MH         |

---

### RNF06 — Testabilidade

| ID      | Requisito                                                                                                              | Prioridade |
|---------|------------------------------------------------------------------------------------------------------------------------|------------|
| RNF06.1 | O sistema deve possuir testes unitários implementados com Jest para os serviços e controladores dos módulos principais | MH         |
| RNF06.2 | Deve ser gerado um relatório de testes com cobertura dos casos de uso implementados                                    | MH         |
| RNF06.3 | Deve ser realizado um teste de validação com um usuário real, com relatório de validação gerado                        | MH         |

---

### RNF07 — Arquitetura e Padrões Técnicos

| ID      | Requisito                                                                                                                                | Prioridade |
|---------|------------------------------------------------------------------------------------------------------------------------------------------|------------|
| RNF07.1 | A arquitetura deve seguir o padrão MVC Distribuído em 3 camadas: Apresentação (Next.js), Lógica de Negócio (NestJS) e Dados (PostgreSQL) | MH         |
| RNF07.2 | A comunicação entre frontend e backend deve ocorrer exclusivamente via API REST com dados em formato JSON                                | MH         |
| RNF07.3 | O sistema deve utilizar TypeScript em ambas as camadas (frontend e backend)                                                              | MH         |
| RNF07.4 | O banco de dados relacional principal deve ser PostgreSQL; módulos de log assíncrono podem utilizar banco NoSQL integrado                | MH         |

---

## Consolidação por Prioridade (Resumo)

### Must Have — Entrega Obrigatória
Gestão de Eventos, Gestão de Pessoas e Acessos, Painel do Participante, Faturamento e Inscrições, Gestão de Atividades e Cronograma, Submissões e Revisão, Alocação de Espaços, Gestão de Inventário, Comunicação (e-mails), Repositório de Conteúdo Digital, Certificação Automatizada, Gestão de Divulgação, Gestão de Relatórios (principais), todos os RNFs de segurança, desempenho, arquitetura e testabilidade.

### Should Have — Recomendado
Log Assíncrono (NoSQL), QR Code para check-in, Notificações push, Segmentação de comunicados, Exportação de relatórios em PDF/CSV, Relatórios de alocação e inventário, Auditoria de certificados, Galeria de fotos categorizada, Alertas de estoque crítico.

### Could Have — Bônus Acadêmico
Web Services RESTful públicos (API com Swagger), Módulo de Recomendação via IA.

---

## Stack Tecnológico de Referência

| Camada                    | Tecnologia                                           |
|---------------------------|------------------------------------------------------|
| Apresentação Web          | React + Next.js (TypeScript)                         |
| Aplicativo Móvel          | PWA Gerado a partir do site                          |
| Lógica de Negócio         | NestJS (TypeScript)                                  |
| Banco de Dados Principal  | PostgreSQL                                           |
| ORM                       | Prisma                                               |
| Log Assíncrono            | MongoDB                                              |
| Armazenamento de Arquivos | Local File System (dev) / AWS S3 ou MinIO (produção) |
| Conteinerização           | Docker + Docker Compose                              |
| Testes                    | Jest                                                 |

---

## Associação com Entregas do Trabalho Acadêmico

| Entrega | Itens do Projeto                                                        | Módulos Relacionados         |
|---------|-------------------------------------------------------------------------|------------------------------|
| **P1**  | Escopo, Requisitos, Casos de Uso, Arquitetura, Diagrama de Classes, DER | Todos os módulos RF01–RF16   |
| **P2**  | Esquema SQL, Dados de Exemplo, Stored Procedures                        | RF04, RF05, RF11, RF07, RF13 |
| **P3**  | Protótipo funcional (≥50% dos casos de uso), Testes unitários           | RF01–RF13 (núcleo)           |
| **P4**  | Validação com usuário real, Documentação de implantação                 | Sistema completo             |

