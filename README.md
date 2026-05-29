# AcadEvent - Sistema de Gerenciamento de Eventos Acadêmicos

Este é o repositório central (Monorepo) do projeto **AcadEvent**, desenvolvido para a disciplina de Tópicos em Computação 2 (2026). O sistema foi projetado sob o padrão de **MVC Distribuído em 3 Camadas** (Apresentação, Lógica de Negócio e Dados), garantindo total desacoplamento e escalabilidade independente.

Este documento detalha a infraestrutura base do ecossistema, as decisões arquiteturais adotadas e o passo a passo definitivo para execução por todos os membros da equipe.

---

## 🏛️ Arquitetura do Sistema e Decisões Técnicas

Durante o desenvolvimento da infraestrutura base pela **Squad SBE**, as seguintes decisões de engenharia de software foram tomadas e consolidadas:

### 1. Estrutura de Monorepo Coeso

Optamos por centralizar a camada de apresentação (`frontend/`) e a camada de lógica de negócio (`backend/`) em um único repositório raiz. Isso facilita o versionamento conjunto do ecossistema, simplifica a orquestração do ambiente local e unifica as políticas de CI/CD e governança do projeto.

### 2. Conteinerização Integral (Atendimento ao RNF05.1)

Todo o ambiente de desenvolvimento local foi encapsulado via **Docker e Docker Compose**. Nenhum desenvolvedor precisa instalar instâncias locais de bancos de dados ou drivers específicos em suas máquinas operacionais. Isso elimina o clássico problema de inconsistência de ambientes, garantindo paridade absoluta entre Windows (WSL), Linux e macOS.

### 3. PostgreSQL 17 e Prevenção de Injeção SQL (Atendimento ao RNF07.4 e RNF03.3)

Adotamos o **PostgreSQL 17-alpine** como o banco de dados relacional oficial do projeto devido à sua alta performance no gerenciamento de conexões concorrentes e integridade referencial. A comunicação da camada de lógica é gerenciada pelo **Prisma ORM**, que gera automaticamente tipos TypeScript baseados no esquema de dados e elimina riscos de segurança contra ataques de *SQL Injection* ao impedir o uso de queries em texto puro na base de código.

### 4. Resolução de Rede e Portas Coexistentes (Atendimento ao RNF07.1)

Para mitigar os bloqueios nativos de isolamento de rede do Docker, aplicamos configurações específicas de escuta:

* **Backend (NestJS):** Rodando nativamente na porta `3000`.
* **Frontend (Next.js):** Configurado explicitamente via variáveis de ambiente (`PORT: 3001` e `HOSTNAME: 0.0.0.0`) para escutar requisições externas de fora do container, coexistindo pacificamente com a porta do backend.
* Ambos operam integrados sob uma rede privada virtual isolada do tipo `bridge` (`acadevent_network`).

### 5. Organização de Código "Package by Feature" (Atendimento ao RNF05.2)

Para os desenvolvedores do backend, a organização do diretório `backend/src/` deve obrigatoriamente seguir o padrão **Package by Feature**. Cada módulo do sistema (ex: inscrições, certificados, eventos) deve agrupar de forma coesa seus próprios controladores, serviços, módulos e repositórios em uma única pasta, evitando diretórios gigantescos e desconexos.

---

## 📂 Estrutura de Diretórios Atual

```text
acadevent/                    # Pasta raiz do Monorepo
├── .postgres-data/           # Dados persistidos do banco PostgreSQL (Ignorado no Git)
├── backend/                  # Camada de Lógica de Negócio (NestJS)
│   ├── prisma/               # Esquemas e migrações do banco de dados
│   ├── src/                  # Código-fonte da API REST (TypeScript)
│   ├── Dockerfile.dev        # Receita de container para o ambiente de desenvolvimento
│   └── .env                  # Variáveis de ambiente locais do backend (Ignorado no Git)
├── frontend/                 # Camada de Apresentação (React + Next.js App Router)
│   ├── src/                  # Componentes e páginas da interface (TypeScript)
│   └── Dockerfile.dev        # Receita de container para o ambiente de desenvolvimento
├── .gitignore                # Escudo global de arquivos ignorados no controle de versão
└── docker-compose.yml        # Orquestrador oficial do ecossistema de containers

```

---

## 🛠️ Pré-requisitos para a Equipe

Antes de inicializar o projeto, certifique-se de possuir instalado em sua máquina operacional:

1. **Docker Desktop** (O Docker Engine deve estar ativo).
2. **Git** configurado globalmente.
3. Extensão do **Git Flow** instalada no terminal.
4. **Chave SSH** configurada no seu perfil do GitHub (O GitHub bloqueou a autenticação por usuário/senha tradicional).

---

## 🚀 Como Executar o Projeto (Passo a Passo)

Siga rigorosamente as instruções abaixo para clonar e rodar o projeto localmente:

### 1. Clonar o Repositório

Use sempre a URL **SSH** para clonar de forma segura sem requisições repetitivas de tokens:

```bash
git clone git@github.com:sua-organizacao/acadevent.git
cd acadevent

```

### 2. Inicializar o Git Flow Localmente

Para garantir que as ramificações de tarefas funcionem no padrão do projeto, rode o comando abaixo na pasta raiz:

```bash
git flow init -d

```

*(A flag `-d` aceita automaticamente todas as nomenclaturas padrão do fluxo: `main`, `develop`, `feature/`, etc.)*

### 3. Configurar as Variáveis de Ambiente locais

O Prisma ORM necessita de um arquivo de credenciais local para se comunicar com o banco de dados de desenvolvimento.
Acesse a pasta do backend, verifique se o arquivo `.env` foi criado e certifique-se de que a variável `DATABASE_URL` está preenchida exatamente assim:

```text
DATABASE_URL="postgresql://acadevent_admin:acadevent_local_pwd@localhost:5432/acadevent_db?schema=public"

```

### 4. Subir o Ecossistema Docker

Retorne para a **pasta raiz do monorepo** (`acadevent/`) e execute o comando de inicialização automática dos containers:

```bash
docker compose up

```

*Nota: Na primeiríssima vez que você executar esse comando, o Docker irá construir as imagens e instalar as dependências do zero, o que pode levar cerca de 1 a 3 minutos. Nas execuções seguintes, o carregamento é instantâneo.*

### 5. Verificar a Disponibilidade das Camadas

Com os containers ativos, abra o seu navegador e certifique-se de que os seguintes endereços estão respondendo:

* **Camada de Apresentação (Frontend):** [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001) (Interface Next.js com Tailwind CSS)
* **Camada de Lógica (Backend/API):** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) (Mensagem "Hello World!" do NestJS)
* **Camada de Dados (Banco PostgreSQL):** Rodando de forma isolada na porta `5432`.

---

## ⚖️ Diretrizes de Governança e Git Flow (Obrigatório)

Para manter o histórico de commits legível e auditável para as entregas dos marcos acadêmicos, todas as squads devem seguir estas regras de ouro:

1. **Nunca commite diretamente na `main` ou na `develop`:** Toda nova tarefa deve ser criada a partir de uma feature branch isolada.
* Para iniciar uma tarefa: `git flow feature start nome-da-tarefa`


2. **Mensagens de Commit Padronizadas (Conventional Commits):** Cada commit deve possuir um tipo legível:
* `feat(...)`: Nova funcionalidade ou requisito funcional completo.
* `fix(...)`: Correção de bug ou comportamento inesperado.
* `docs(...)`: Alterações estritas em documentações ou arquivos MD.
* `chore(...)`: Mudanças em configurações, ferramentas, Docker ou pacotes de dependências.
* *Exemplo de commit válido:* `feat(cadastro): adiciona validacao de CPF no formulario`


3. **Fechamento via Pull Request (PR):** Quando sua funcionalidade estiver concluída, publique-a no remoto via `git flow feature publish nome-da-tarefa` e abra um Pull Request direcionado para a branch `develop` no GitHub. **Nunca** execute o comando `git flow feature finish` localmente antes de o PR ser revisado e aprovado pela gerência de projeto (`SPR` / `SPM`).