# AcadEvent - Sistema de Gerenciamento de Eventos Acadêmicos

Este é o repositório central (Monorepo) do projeto **AcadEvent**, desenvolvido para a disciplina de Tópicos em Computação 2 (2026). O sistema foi projetado sob o padrão de **MVC Distribuído em 3 Camadas** (Apresentação, Lógica de Negócio e Dados), garantindo total desacoplamento e escalabilidade independente.

Este documento detalha a infraestrutura base do ecossistema, as decisões arquiteturais adotadas e o passo a passo definitivo para execução por todos os membros da equipe.

---

## 🏛️ Arquitetura do Sistema e Decisões Técnicas

Durante o desenvolvimento da infraestrutura base pela **Squad SBE**, as seguintes decisões de engenharia de software foram tomadas e consolidadas:

### 1. Estrutura de Monorepo Coeso

Optamos por centralizar a camada de apresentação (`frontend/`) e a camada de lógica de negócio (`backend/`) em um único repositório raiz. Isso facilita o versionamento conjunto do ecossistema, simplifica a orquestração do ambiente local e unifica as políticas de CI/CD e governança do projeto.

### 2. Conteinerização Integral (Atendimento ao RNF05.1)

O desenvolvimento local usa **Docker Compose** (`docker-compose.yml` + `Dockerfile.dev`) para subir frontend, backend e Postgres juntos. Em produção no **Quave ONE**, cada camada é um **app/env separado** (não usamos Compose): Postgres gerenciado como Databases & Services, e `backend` / `frontend` cada um com seu `Dockerfile` de produção, implantados via CLI (`--dir`) ou GitHub. Nenhum desenvolvedor precisa instalar bancos ou drivers locais; o ambiente de equipe permanece alinhado entre Windows (WSL), Linux e macOS.

### 3. PostgreSQL 17 e Prevenção de Injeção SQL (Atendimento ao RNF07.4 e RNF03.3)

Adotamos o **PostgreSQL 17-alpine** como o banco de dados relacional oficial do projeto devido à sua alta performance no gerenciamento de conexões concorrentes e integridade referencial. A comunicação da camada de lógica é gerenciada pelo **Prisma ORM**, que gera automaticamente tipos TypeScript baseados no esquema de dados e elimina riscos de segurança contra ataques de *SQL Injection* ao impedir o uso de queries em texto puro na base de código.

### 4. Resolução de Rede e Portas Coexistentes (Atendimento ao RNF07.1)

**Local (Compose):** backend `3000`, frontend `3001`, Postgres `5432`, rede `acadevent_network`.

**Quave ONE (prod):** cada app/env escuta na porta configurada no Quave (hoje **3000** no `backend` e no `frontend`). O Postgres é um app Databases & Services separado, acessado via `DATABASE_URL` (URL interna do Quave).

### 5. Organização de Código "Package by Feature" (Atendimento ao RNF05.2)

Para os desenvolvedores do backend, a organização do diretório `backend/src/` deve obrigatoriamente seguir o padrão **Package by Feature**. Cada módulo do sistema (ex: inscrições, certificados, eventos) deve agrupar de forma coesa seus próprios controladores, serviços, módulos e repositórios em uma única pasta, evitando diretórios gigantescos e desconexos.

---

## 📂 Estrutura de Diretórios Atual

```text
acadevent/                    # Pasta raiz do Monorepo
├── .postgres-data/           # Dados persistidos do banco PostgreSQL (Ignorado no Git)
├── docs/                     # Documentação geral do projeto (padrões, governança)
├── backend/                  # Camada de Lógica de Negócio (NestJS)
│   ├── docs/
│   ├── prisma/
│   ├── src/
│   ├── Dockerfile            # Produção Quave ONE (CLI --dir backend)
│   ├── Dockerfile.dev        # Desenvolvimento (Compose)
│   ├── .dockerignore
│   ├── .quaveoneignore
│   └── .env                  # Local only (Ignorado no Git)
├── frontend/                 # Camada de Apresentação (Next.js)
│   ├── docs/
│   ├── src/
│   ├── Dockerfile            # Produção Quave ONE (CLI --dir frontend)
│   ├── Dockerfile.dev        # Desenvolvimento (Compose)
│   ├── .dockerignore
│   └── .quaveoneignore
├── .gitignore
└── docker-compose.yml        # Stack local apenas

```

---

## 🛠️ Pré-requisitos para a Equipe

Antes de inicializar o projeto, certifique-se de possuir instalado em sua máquina operacional:

1. **Docker Desktop** (O Docker Engine deve estar ativo).
2. **Git** configurado globalmente.
3. Extensão do **Git Flow** instalada no terminal.
4. **Chave SSH** configurada no seu perfil do GitHub (O GitHub bloqueou a autenticação por usuário/senha tradicional).

---

## 🚀 Como Executar o Projeto

### Local (Docker Compose)

```bash
git clone git@github.com:AcadEvent/acadevent.git
cd acadevent
git flow init -d
```

Configure `backend/.env` (Prisma fora do Compose, se necessário):

```text
DATABASE_URL="postgresql://acadevent_admin:acadevent_local_pwd@localhost:5432/acadevent_db?schema=public"
```

```bash
docker compose up
```

Serviços isolados:

```bash
docker compose up postgres backend
docker compose up frontend
docker compose up postgres
```

- **Frontend:** http://localhost:3001
- **Backend/API:** http://localhost:3000
- **PostgreSQL:** porta `5432`

Derrubar: `docker compose down`

### Produção (Quave ONE — um app/env por camada)

O Quave ONE **não** executa Compose. Cada serviço é um App com seu environment:

| Camada | Quave App | Env CLI name | Deploy |
| --- | --- | --- | --- |
| Dados | `Database` (`POSTGRESQL`) | `vitor-teste-database-production` | Gerenciado pela plataforma |
| API | `backend` | `vitor-teste-backend-production` | `backend/Dockerfile` · porta **3000** |
| UI | `frontend` | `vitor-teste-frontend-production` | `frontend/Dockerfile` · porta **3000** |

Hosts públicos: API `https://api.erwinlabs.dev`, app `https://app.erwinlabs.dev`.

#### Configuração esperada no Quave

- **Docker:** `CUSTOM` com `Dockerfile` **dentro** da pasta enviada (`backend/` ou `frontend/`).
- **CLI `--dir`:** envie só a pasta do app. Com `--dir backend`, o path do Dockerfile é `Dockerfile` (não `backend/Dockerfile`).
- **Port** do app env = `EXPOSE` do Dockerfile (`3000`).
- **Backend:** `DATABASE_URL` (tipo `BOTH`/`DEPLOY`) = URL interna do Postgres Quave.
- **Frontend:** `NEXT_PUBLIC_API_URL` tipo `BOTH` (entra no build do Next), `PORT=3000`, `HOSTNAME=0.0.0.0`. No browser use a URL **pública** da API (`https://api.erwinlabs.dev`).

#### Deploy via CLI

```bash
quaveone deploy \
  --user-token <token> \
  --env vitor-teste-backend-production \
  --dir backend \
  --wait

quaveone deploy \
  --user-token <token> \
  --env vitor-teste-frontend-production \
  --dir frontend \
  --wait
```

Cada pasta tem `.quaveoneignore` para não enviar `node_modules`, builds e `.env`.

---

## ⚖️ Diretrizes de Governança e Fluxo de Branches (Obrigatório)

Para manter o histórico de commits legível, auditável e garantir a segurança do ambiente de produção, todas as squads devem seguir as diretrizes estabelecidas no documento [Guia de Governança Git e Fluxo de Branches](docs/fluxo-de-branches.md):

1. **Estrutura de Branches:**
   * **`main` (Read-Only):** Branch de produção estritamente em modo de leitura. Não aceita commits nem PRs diretos. Sua atualização é realizada automaticamente a partir da branch `dev` via GitHub Actions (`auto-merge.yml`).
   * **`dev`:** Branch principal de integração e desenvolvimento. Todas as branches de trabalho (`feature/*`, `fix/*`, `docs/*`, etc.) devem ser **obrigatoriamente criadas a partir da branch `dev`**.

2. **Mensagens de Commit Padronizadas (Conventional Commits):** Cada commit e título de Pull Request deve possuir um tipo legível e semântico:
   * `feat(...)`: Nova funcionalidade ou requisito funcional completo.
   * `fix(...)`: Correção de bug ou comportamento inesperado.
   * `docs(...)`: Alterações estritas em documentações ou arquivos MD.
   * `chore(...)`: Mudanças em configurações, ferramentas, Docker ou pacotes de dependências.
   * *Exemplo de commit válido:* `feat(cadastro): adiciona validacao de CPF no formulario`

3. **Integração via Pull Request (PR):** Quando a tarefa for concluída na branch de trabalho, publique-a no remoto (`git push -u origin feature/sua-tarefa`) e abra um Pull Request direcionado para a branch `dev`. Para mais detalhes, consulte o [docs/fluxo-de-branches.md](docs/fluxo-de-branches.md).

