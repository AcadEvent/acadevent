# Workflows do GitHub Actions - AcadEvent

- Versão: 1.1
- Data: 2026-08-06
- Autor: José Carlos da Silva Filho (SPM)
- Revisores: —

---

## Visão Geral

Este diretório contém as automações do **GitHub Actions** utilizadas no repositório do **AcadEvent** para integração contínua (CI), execução de testes automatizados, verificação de padronizações e sincronização entre branches.

## Lista de Workflows

| Workflow | Arquivo | Descrição Sucinta |
| --- | --- | --- |
| **Auto Assign** | `auto-assign.yml` | Solicita revisores de código automaticamente em Pull Requests abertos, reabertos ou marcados como prontos para revisão. |
| **Sync Dev to Main** | `auto-merge.yml` | Sincroniza a branch `dev` com a branch `main` de forma automática (via fast-forward ou PR automático) a cada push/merge na `dev`. |
| **Validar Documentação** | `check-docs.yml` | Verifica se todos os arquivos Markdown (`.md`) alterados no repositório contêm o cabeçalho de metadados obrigatório. |
| **Conventional Commit Checks** | `conventional-commits.yml` | Valida se os commits em branches de trabalho e os títulos dos Pull Requests seguem a especificação Conventional Commits. |
| **Rodar Testes Backend** | `testes-backend.yml` | Configura o ambiente Node.js, gera o Prisma Client, instala dependências e executa a suíte de testes do backend NestJS. |
| **Rodar Testes Frontend** | `testes-frontend.yml` | Configura o ambiente Node.js, instala dependências e executa a suíte de testes da interface frontend em Next.js/React. |

