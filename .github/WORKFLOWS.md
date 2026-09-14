# Workflows do GitHub Actions - AcadEvent

- Versão: 1.2
- Data: 2026-09-08
- Autores: José Carlos da Silva Filho (SPM), João Vitor Antunes da Silva (SPM)
- Revisores: —

---

## Visão Geral

Este diretório contém as automações do **GitHub Actions** utilizadas no repositório do **AcadEvent** para integração contínua (CI), execução de testes automatizados, verificação de padronizações, sincronização entre branches e redeploy automático no **Quave ONE** a partir da `main`.

## Lista de Workflows

| Workflow | Arquivo | Descrição Sucinta |
| --- | --- | --- |
| **Auto Assign** | `auto-assign.yml` | Solicita revisores de código automaticamente em Pull Requests abertos, reabertos ou marcados como prontos para revisão. |
| **Sync Dev to Main** | `auto-merge.yml` | Sincroniza a branch `dev` com a branch `main` de forma automática (via fast-forward ou PR automático) a cada push/merge na `dev`. Em seguida chama os deploys do Quave ONE para as camadas cujo conteúdo mudou na `main`. |
| **Validar Documentação** | `check-docs.yml` | Verifica se todos os arquivos Markdown (`.md`) alterados no repositório contêm o cabeçalho de metadados obrigatório. |
| **Conventional Commit Checks** | `conventional-commits.yml` | Valida se os commits em branches de trabalho e os títulos dos Pull Requests seguem a especificação Conventional Commits. |
| **Rodar Testes Backend** | `testes-backend.yml` | Configura o ambiente Node.js, gera o Prisma Client, instala dependências e executa a suíte de testes do backend NestJS. |
| **Rodar Testes Frontend** | `testes-frontend.yml` | Configura o ambiente Node.js, instala dependências e executa a suíte de testes da interface frontend em Next.js/React. |
| **Deploy backend** | `quaveone-deploy-backend.yml` | Redeploy do backend no Quave ONE (`vitor-teste-backend-production`) a partir da `main`. Disparado pelo `auto-merge.yml` após sincronizar `dev` → `main`, ou por push/merge na `main` que não use `GITHUB_TOKEN`. |
| **Deploy frontend** | `quaveone-deploy-frontend.yml` | Redeploy do frontend no Quave ONE (`vitor-teste-frontend-production`) a partir da `main`. Disparado pelo `auto-merge.yml` após sincronizar `dev` → `main`, ou por push/merge na `main` que não use `GITHUB_TOKEN`. |

## Secret do Quave ONE

Os workflows de deploy usam o token de usuário documentado em [GitHub Action | Quave ONE Docs](https://docs.quave.cloud/cli/github-action). Crie o secret `QUAVEONE_USER_TOKEN` em **Settings → Secrets and variables → Actions**, com o token de [app.quave.cloud/profile](https://app.quave.cloud/profile).

## Git flow e gatilhos de deploy

A `main` é read-only: o caminho normal é PR em `dev` → `auto-merge.yml` atualiza `main` (push fast-forward ou PR de sync). Esse push/merge usa `GITHUB_TOKEN`, e o GitHub **não** inicia outros workflows a partir de eventos gerados com esse token. Por isso o deploy não pode depender só de `on: push` na `main`.

| Como a `main` muda | O que dispara o deploy |
| --- | --- |
| `auto-merge.yml` (push `dev` → `main`, ou PR automático `dev` → `main`) | `workflow_call` a partir do próprio `auto-merge.yml`, só se `backend/` ou `frontend/` mudou |
| Push direto na `main` (fora da política, ex. admin) | `on: push` nos workflows de deploy |
| Merge de PR na `main` feito por um usuário (não `GITHUB_TOKEN`) | `on: push` gerado pelo merge |
| PR aberto contra `main` (bloqueado pela política) | Nenhum deploy — não se publica código ainda não mergeado |

