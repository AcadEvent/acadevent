# Decisões de Segurança — Backend AcadEvent

Versão: 1.0  
Data: 2026-09-30  
Autor: Sizenando França (SBE)  
Revisores: José Carlos da Silva Filho (SPM)

---

A formatação deste documento segue o [padrão de documentação do projeto](../../docs/padrao-de-documentacao.md).  
Para decisões complementares, consulte: [Arquitetura](./decisoes-de-arquitetura.md), [Banco e Concorrência](./decisoes-de-banco-e-concorrencia.md), [Contratos de API](./decisoes-de-api.md) e [Decisões por Módulo](./decisoes-dos-modulos.md).

## 1. Visão Geral de Segurança

A arquitetura de segurança do **AcadEvent** adota o princípio de **Defesa em Profundidade (Defense-in-Depth)** e alinhamento com as diretrizes do **OWASP Top 10** e **CWE (Common Weakness Enumeration)**.

Este documento consolida as diretrizes, ameaças mitigadas e decisões formais de segurança estabelecidas durante a implementação e revisões do Marco P3 (PR #44).

---

## 2. Autenticação e Gestão de Sessão (RF02 / RNF03)

### 2.1 Padrão JWT Stateless

- A autenticação é 100% stateless via **JSON Web Tokens (JWT)** com algoritmo HMAC SHA-256 (`HS256`).
- **Validade do Token:** 7 dias (`expiresIn: '7d'`).
- **Estrutura do Payload (`JwtPayload`):**
  - `sub`: Identificador numérico único do usuário (`id_usuario`).
  - `email`: E-mail oficial cadastrado.
  - `nome`: Nome completo do usuário.
  - `perfis`: Lista de papéis ativos (`participante`, `organizador`, `administrador`, `parecerista`, `ministrante`).

### 2.2 Criptografia de Credenciais

- Senhas são armazenadas como hash unidirecional utilizando **bcrypt** com fator de custo (_salt rounds_) igual a 10.
- Nenhuma senha em texto puro transita internamente nem é persistida.

### 2.3 Expurgo de Dados Sensíveis e LGPD

- **Hash de Senha:** É terminantemente proibido projetar o campo `senha_hash` em qualquer resposta da API.
- Nas consultas de credenciamento de QR Code (`validarQrCode`), o objeto do usuário expurga explicitamente `senha_hash` antes de responder ao organizador.
- Na validação pública de certificados (`GET /certificados/:codigo/validar`), o endereço de e-mail do titular é ofuscado via máscara criptográfica (ex.: `j***o@dominio.com`) para conformidade com a LGPD.

---

## 3. Decisão Crítica: _Fail-Fast_ de Segredos de Ambiente (CWE-798)

Durante a auditoria de código (Item 2.6 da revisão), foi identificada a presença de segredos padrão estáticos no código-fonte para casos em que variáveis de ambiente não fossem definidas.

### Diretriz Estabelecida:

É vedado o uso de strings de fallback para segredos criptográficos. O sistema deve adotar o princípio **Fail-Fast**:

1. **`JWT_SECRET`:** Se a variável não estiver presente no `process.env`, a aplicação recusa a inicialização no bootstrap (`throw new Error('JWT_SECRET nao definido no ambiente.')`), impedindo que o servidor suba em estado inseguro.
2. **`WEBHOOK_SECRET`:** Caso a variável não seja fornecida nas configurações do container/servidor, o endpoint `POST /pagamentos/webhook` rejeita **100% das requisições com HTTP 401 Unauthorized**.

---

## 4. Autorização e Controle de Acesso Baseado em Papéis (RBAC - CWE-284)

O controle de acesso é aplicado de forma declarativa e granular via Guards do NestJS.

### 4.1 Mecanismo de Funcionamento:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('organizador', 'administrador')
```

1. **`JwtAuthGuard`:** Valida o cabeçalho `Authorization: Bearer <token>`. Em caso de ausência ou token inválido/expirado, retorna `401 Unauthorized`.
2. **`RolesGuard`:** Inspeciona os metadados definidos pelo decorator `@Roles(...)` através do `Reflector`.
   - Se o usuário possuir o perfil `'administrador'`, o acesso é concedido imediatamente (bypass de superusuário).
   - Se o usuário possuir ao menos um dos papéis requeridos, o acesso é liberado.
   - Caso contrário, retorna `403 Forbidden`.

### 4.2 Matriz de Acesso aos Módulos Operacionais:

| Módulo / Rota                                                      | Ações                                                       | Papéis Permitidos                                                                              |
| ------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/eventos` (Criação de evento/edição)                              | `POST /eventos`                                             | `participante` (auto-promove a organizador), `organizador`, `administrador`                    |
| `/eventos/edicoes/:id/status`                                      | `PATCH`                                                     | `organizador` (dono do evento) ou `administrador`                                              |
| `/espacos`                                                         | `POST /espacos`, `POST /espacos/reservar`                   | `organizador`, `administrador`                                                                 |
| `/atividades`                                                      | `POST /atividades`, `POST /atividades/associar-ministrante` | `organizador`, `administrador`                                                                 |
| `/atividades/inscrever`                                            | `POST`                                                      | Autenticado (`@CurrentUser()`)                                                                 |
| `/atividades/chamada`                                              | `POST`                                                      | `organizador`, `ministrante`, `administrador`                                                  |
| `/inscricoes/lotes`, `/cupons`                                     | `POST` / `GET (admin)`                                      | `organizador`, `administrador`                                                                 |
| `/inscricoes` (Inscrição em evento)                                | `POST /inscricoes`                                          | Autenticado (`@CurrentUser()`)                                                                 |
| `/inscricoes/validar-qrcode`                                       | `POST`                                                      | `organizador`, `administrador`                                                                 |
| `/pagamentos/confirmar-manual`                                     | `POST`                                                      | `organizador`, `administrador`                                                                 |
| `/pagamentos/relatorio/edicao/:id`                                 | `GET`                                                       | `organizador`, `administrador`                                                                 |
| `/certificados/atividade`                                          | `POST`                                                      | Autenticado (`@CurrentUser()` emitindo para si); `organizador`, `administrador` para terceiros |
| `/storage/upload`                                                  | `POST`                                                      | Autenticado (`JwtAuthGuard`)                                                                   |
| `/comunicacao/enviar`                                              | `POST`                                                      | `organizador`, `administrador`                                                                 |
| `/comunicacao/minhas-notificacoes`                                 | `GET`                                                       | Autenticado (`@CurrentUser()`)                                                                 |
| `/inventario/*` (Itens, Retiradas, Devoluções, Alertas, Relatório) | `POST`, `PATCH`, `GET`                                      | `organizador`, `administrador` (blindagem de classe no controller)                             |
| `/submissoes/avaliacoes`                                           | `POST`                                                      | `parecerista` (com validação anti-conflito)                                                    |
| `/admin/logs`                                                      | `GET`                                                       | `administrador`                                                                                |

---

## 5. Prevenção de IDOR e _Blind Access Control_ (CWE-639)

A referência direta e insegura a identificadores de entidade foi erradicada em todas as camadas de controle e serviço:

1. **Eliminação de Cabeçalhos Inseguros:**
   - O cabeçalho manipulável `x-usuario-id` foi completamente eliminado do código.
   - Toda extração de identidade do solicitante é realizada exclusivamente via token criptográfico através do decorator customizado `@CurrentUser()`.
2. **Emissão de Certificados (`certificados.controller.ts`):**
   - O participante comum emite exclusivamente o **seu próprio** certificado (`id_usuario` retirado do JWT).
   - Apenas perfis administrativos ou organizadores podem passar opcionalmente um `id_usuario` no DTO para emitir certificados em lote ou em nome de terceiros.
3. **Retirada de Inventário (`inventario.service.ts`):**
   - O serviço resolve o perfil do organizador pelo `id_usuario` autenticado. Se o cliente enviar um `id_organizador` conflitante no corpo da requisição, a operação é rejeitada com `403 Forbidden`.
4. **Avaliação de Artigos e Conflito de Interesses (`submissoes.service.ts`):**
   - O parecerista é identificado pelo token JWT.
   - O sistema verifica no banco se o parecerista autenticado figura como autor ou coautor da submissão (`submissao.autor.id_usuario === parecerista.id_usuario`). Em caso positivo, aborta com `403 Forbidden` (_Blind Review Integrity_).
5. **Transição de Status de Evento (`eventos.service.ts`):**
   - Apenas o usuário que possui o evento associado ao seu perfil de organizador (`edicao.evento.organizador.id_usuario === usuario.id_usuario`) ou administradores globais podem transicionar status.

---

## 6. Prevenção de Path Traversal no Módulo de Storage (CWE-22)

### Ameaça Identificada:

Em implementações ingênuas de download de arquivos estáticos, o uso de `path.resolve(base, subpasta, nome)` com entradas não sanitizadas como `..` ou `%2e%2e` permite que atacantes acessem arquivos confidenciais fora da pasta de uploads (como o arquivo `.env` ou chaves privadas do servidor).

### Decisão e Mitigação Implementada (`storage.controller.ts`):

1. **Decodificação e Sanitização de Caracteres Perigosos:**
   - O controller aplica `decodeURIComponent` em parâmetros de rota e rejeita qualquer valor que contenha sequências `..`, `%2e%2e` ou bytes nulos (`\0`), retornando `403 Forbidden`.
2. **Validação de Confinamento Estrito de Diretório:**

   ```typescript
   const uploadDir = path.resolve(process.cwd(), 'uploads');
   const caminho = path.resolve(uploadDir, decodedSubpasta, decodedNome);

   if (!caminho.startsWith(uploadDir + path.sep)) {
     throw new ForbiddenException('Acesso negado ao caminho solicitado.');
   }
   ```

   Qualquer tentativa de navegação relativa que resulte em caminho fora de `uploads/` é bloqueada antes de qualquer acesso ao sistema de arquivos.

---

## 7. Upload Seguro e Prevenção de Stored XSS (CWE-434)

Para impedir o envio de scripts executáveis (como arquivos `.html` ou `.svg` maliciosos com JavaScript embutido) ou arquivos executáveis que possam comprometer a origem da aplicação:

1. **Whitelist Restrita de Extensões:**
   - `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.xls`, `.xlsx`.
2. **Whitelist Restrita de MIME Types:**
   - `application/pdf`, `image/png`, `image/jpeg`, `image/webp` e formatos Microsoft Office correspondentes.
3. **Validação Dupla:**
   - Validação prévia no `fileFilter` do Multer/FileInterceptor para rejeitar o stream antes do armazenamento em buffer.
   - Validação pós-upload defensiva em `validarArquivo(file)`.
4. **Limite de Volume:**
   - Limite máximo de 15 MB por arquivo (`fileSize: 15 * 1024 * 1024`).
5. **Autenticação Obrigatória:**
   - O endpoint `POST /storage/upload` é restrito a usuários autenticados via `JwtAuthGuard`.

---

## 8. Segurança e Idempotência de Pagamentos e Webhooks

1. **Validação por Tempo Constante (Timing-Safe Equal):**
   - A conferência do segredo de webhook contra o `process.env.WEBHOOK_SECRET` utiliza `crypto.timingSafeEqual` sobre buffers de bytes.
   - Isso anula qualquer possibilidade de exploração de vulnerabilidades de canal lateral baseadas em tempo (_Timing Attacks_) para dedução do segredo caractere por caractere.
2. **Idempotência no Processamento de Webhooks:**
   - Reenvios do gateway com status `'Aprovado'` para transações já aprovadas são respondidos com sucesso sem regenerar o hash do QR Code previamente concedido ao participante.
   - Notificações de `'Estornado'` ou `'Cancelado'` que ocorram após a aprovação inicial atualizam atomicamente o pagamento e a inscrição para `'Estornada'` ou `'Cancelada'`, evitando fraudes de estorno não registrado.

---

## 9. Proteção do Fluxo de Inscrição e Credenciamento

1. **Entropia Criptográfica do QR Code:**
   - Hashes de QR Code utilizam gerador de números pseudoaleatórios criptograficamente seguros (CSPRNG): `crypto.randomBytes(16).toString('hex')` (128 bits de entropia).
2. **Proteção Anti-Replay no Credenciamento:**
   - A rota de check-in (`POST /inscricoes/validar-qrcode`) valida o status `'Confirmada'` e rejeita validações repetidas de um mesmo código.
   - O endpoint é de acesso restrito a organizadores e administradores devidamente autenticados.
3. **Ocultação de Cupons de Desconto:**
   - A rota pública `GET /eventos/:slug` não projeta a relação de cupons nem seus respectivos percentuais de desconto. A validação do cupom ocorre exclusivamente no ato da inscrição.
