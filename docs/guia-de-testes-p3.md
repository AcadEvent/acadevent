# Guia de Execucao e Testes do Backend - Marco P3 (Squad Backbone)

Versao: 1.0
Data: 2026-09-15
Autor: Sizenando Franca (SBE)
Revisores: —

---

## 1. Contexto e Escopo dos Entregaveis (P3)

Este documento descreve as implementacoes realizadas pela **Squad Backbone (SBE)** para a entrega do **Marco P3** do AcadEvent, bem como o roteiro completo de inicializacao e validacao dos endpoints no backend NestJS.

### Modulos Implementados:
- **`auth` (RF02 / RNF03)**: Cadastro com hash `bcrypt`, Login emitindo JWT com controle de papeis (RBAC), decorators `@CurrentUser()` e `@Roles(...)`, guardioes `JwtAuthGuard` e `RolesGuard`.
- **`eventos` (RF01)**: Cadastro atomico de evento e edicao (`POST /eventos`), listagem na vitrine publica (`GET /eventos`), busca detalhada (`GET /eventos/:slug`), painel do organizador (`GET /eventos/gerenciar/meus`) e transicao de status (`PATCH /eventos/edicoes/:id/status`).
- **`storage` (RF10 / RNF05.4)**: Padrao Adapter com `StorageServiceBase` e `LocalStorageService`, permitindo salvar arquivos multipart em disco e servi-los por URL relativa (`POST /storage/upload`, `GET /storage/arquivos/:subpasta/:nome`).
- **`certificados` (RF11.5)**: Motor de renderizacao dinamica em PDF com PDFKit no formato A4 Paisagem com moldura grafica institucional, dados do participante/evento e codigo unico de autenticidade (`GET /certificados/:codigo/download`), alem de validacao publica (`GET /certificados/:codigo/validar`).
- **`comunicacao` (RF09)**: Disparo de comunicados para participantes do evento ou de atividades especificas (`POST /comunicacao/enviar`), com historico (`GET /comunicacao/edicao/:id`).
- **`logs` (RF16)**: Interceptor global assincrono (`LoggingInterceptor`) auditando requisicoes HTTP mutatorias, e consulta restrita a administradores (`GET /admin/logs`). No Marco P3, opera via buffer circular em memoria assincrono (`setImmediate`); no Marco P4, sera desacoplado via Adapter para persistencia externa NoSQL (MongoDB / Redis).
- **OpenAPI / Swagger e CORS (RF14)**: Configurados no `main.ts`, com Swagger interativo em `/api/docs` e suporte a Bearer Token.

---

## 2. Passo a Passo para Testar (Roteiro Sem Erros)

Siga rigorosamente a sequencia abaixo para preparar o ambiente local e rodar sem conflitos de portas ou banco:

### Passo 1: Obter o codigo da branch (Se ainda não estiver na dev)
```bash
git checkout feat/sbe-p3-backend-backbone
git pull origin feat/sbe-p3-backend-backbone
```

### Passo 2: Atencao ao PostgreSQL Local (Windows)
> **IMPORTANTE:** Se voce possui o PostgreSQL instalado nativamente no Windows (servico `postgresql-x64-17`), ele inicia automaticamente na porta `5432` e conflitara com o container Docker do projeto.
>
> **Como resolver antes de subir o Docker:**
> 1. Pressione `Win + R`, digite `services.msc` e tecle Enter.
> 2. Localize `postgresql-x64-17`, clique com o botao direito e selecione **Parar**.
> 3. (Ou abra o PowerShell como Administrador e execute: `Stop-Service postgresql-x64-17`).

### Passo 3: Iniciar o Banco de Dados no Docker
Na raiz do repositorio:
```bash
docker compose up -d postgres
```
*(Verifique com `docker ps` se o container `acadevent_postgres` esta ativo mapeando `0.0.0.0:5432->5432/tcp`).*

### Passo 4: Instalar Dependencias e Aplicar Migracoes
Acesse a pasta `backend`:
```bash
cd backend
npm install
npx prisma migrate deploy
```
*(Este comando cria todas as 39 tabelas e procedures no PostgreSQL do Docker).*

### Passo 5: Iniciar o Servidor Backend
```bash
npm run start:dev
```
Aguarde o log: `[NestApplication] Nest application successfully started`.
A documentacao interativa estara acessivel em: **http://localhost:3000/api/docs**

---

## 3. Roteiro de Testes no Swagger UI

Acesse **http://localhost:3000/api/docs** no seu navegador:

Exemplos de alguns testes que podem ser feitos:

### 1. Cadastro de Usuario (`POST /auth/cadastro`)
- Va em **`auth`** -> `POST /auth/cadastro` -> **Try it out**.
- Envie apenas os campos exigidos pela especificacao (RF02.1.1):
  ```json
  {
    "nome": "Participante Teste",
    "email": "teste@acadevent.edu.br",
    "senha": "senhaSegura123"
  }
  ```
- Clique em **Execute**. Retornara **201 Created** com o `access_token`.
- **Copie o token** gerado.

### 2. Autenticacao no Swagger
- No topo da pagina, clique no botao verde **Authorize**.
- Cole o token no campo de texto e clique em **Authorize** -> **Close**.

### 3. Perfil Autenticado (`GET /auth/me`)
- Em **`auth`** -> `GET /auth/me` -> **Execute**.
- Retornara os dados do usuario autenticado e seus papeis (`roles: ["participante"]`).

### 4. Criar Evento e Edicao (`POST /eventos`)
- Em **`eventos`** -> `POST /eventos` -> **Try it out**.
- Cole o JSON:
  ```json
  {
    "nome_marca": "SECINT - Semana de Ciencia e Inovacao",
    "titulo_oficial": "V Semana de Ciencia e Tecnologia do Agreste",
    "sigla": "secint2026",
    "unidade_promotora": "UFAPE",
    "area_tematica": "Tecnologia da Informacao",
    "descricao_geral": "Maior evento de computacao e inovacao academica do Agreste.",
    "data_abertura_evento": "2026-10-20T08:00:00.000Z",
    "data_encerramento_evento": "2026-10-24T18:00:00.000Z",
    "capacidade_max_participantes": 500,
    "endereco": "Av. Bom Pastor, s/n - Garanhuns - PE"
  }
  ```
- Retornara **201 Created**, salvando o evento e a edicao no banco de dados.

### 5. Consultar Vitrine Publica
- Em **`eventos`** -> `GET /eventos` -> **Execute**: Retorna os eventos com status `Publicado`.
- Em **`eventos`** -> `GET /eventos/{slug}`: Digite `secint2026` e execute. Retorna os detalhes da edicao.

### 6. Upload e Download de Arquivos (`storage`)
- Em **`storage`** -> `POST /storage/upload` -> **Try it out**.
- Selecione qualquer arquivo (PDF ou imagem) e execute.
- Copie a `url` retornada (ex: `/storage/arquivos/geral/...`) e abra no navegador precedida de `http://localhost:3000` para visualizar o download.

### 7. Enviar Comunicados (`comunicacao`)
- Em **`comunicacao`** -> `POST /comunicacao/enviar` -> **Try it out**.
  ```json
  {
    "id_edicao": 1,
    "titulo": "Aviso de Credenciamento",
    "conteudo": "O credenciamento inicia as 08:00 no auditorio principal.",
    "perfil_alvo": "participante"
  }
  ```
- Retornara **201 Created**.
- Em `GET /comunicacao/edicao/1`, consulte o historico registrado.

---

## 4. Testes Automatizados (Jest)

Para rodar a suite completa de testes unitarios:
```bash
npm test
```
**Resultado esperado:** 13 test suites aprovadas, 46 testes aprovados (100% de sucesso).
