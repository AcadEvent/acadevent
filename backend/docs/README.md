# Documentação do Backend — AcadEvent

Versão: 1.0  
Data: 2026-09-30  
Autor: João Vitor Antunes da Silva (SPM), Sizenando França (SBE)  
Revisores: José Carlos da Silva Filho (SPM)

---

Decisões de arquitetura, API e padrões de desenvolvimento da camada de lógica de negócio. Este diretório registra o que foi acordado pelo time para manter consistência técnica e facilitar a evolução do backend.

A formatação destes documentos segue o [padrão de documentação do projeto](../../docs/padrao-de-documentacao.md).

## Objetivo

Centralizar decisões que impactam a API REST, o modelo de dados, a organização de módulos e as convenções de código do NestJS — evitando rediscussões e garantindo alinhamento entre squads.

## Documentos

| Documento                                                                    | Conteúdo                                                                                                                                                              |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [decisoes-de-arquitetura.md](./decisoes-de-arquitetura.md)                   | Princípios arquiteturais, padrão Package by Feature, camadas do NestJS, padrão Adapter no Storage, estratégia de auditoria e ciclo de vida de conexões.               |
| [decisoes-de-seguranca.md](./decisoes-de-seguranca.md)                       | Autenticação JWT, modelo RBAC, fail-fast de segredos de ambiente, mitigação de IDOR, prevenção de Path Traversal, upload seguro e conformidade com LGPD.              |
| [decisoes-de-banco-e-concorrencia.md](./decisoes-de-banco-e-concorrencia.md) | Persistência com Prisma ORM, PostgreSQL, bloqueios pessimistas (`FOR UPDATE`), transações atômicas, integridade relacional entre edições e otimizações sem OOM.       |
| [decisoes-de-api.md](./decisoes-de-api.md)                                   | Padrões REST, códigos HTTP, OpenAPI 3.0 / Swagger interativo, CORS, validação defensiva global e convenção de slugs em kebab-case.                                    |
| [decisoes-dos-modulos.md](./decisoes-dos-modulos.md)                         | Revisão técnica aprofundada dos módulos implementados (12 módulos de negócio + Prisma), contratos de endpoints, regras de negócio e matriz de testes unitários e e2e. |

## Persistência local (Prisma)

O esquema e as migrações ficam em `backend/prisma/`. A carga inicial de demonstração veio de `ScriptsBD/script_insert_into_tables.sql` do repositório [AcadEvent/documents](https://github.com/AcadEvent/documents) e está em `backend/prisma/seed.ts`. As rotinas de negócio (`sp_*`) estão em `backend/prisma/sql/procedures.sql` e na migração `align_scripts_bd`.

A partir de `backend/`, com `DATABASE_URL` apontando para o Postgres do `docker-compose.yml` da raiz:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Não altere Dockerfiles nem o `docker-compose.yml` para aplicar o schema: o caminho oficial é Prisma Migrate + seed.

## Escopo deste diretório

| Tema        | Exemplos do que documentar                                   |
| ----------- | ------------------------------------------------------------ |
| Arquitetura | Package by Feature, camadas, contratos entre módulos         |
| API         | Versionamento, formatos de resposta, códigos HTTP, paginação |
| Dados       | Convenções Prisma, migrações, nomenclatura de entidades      |
| Segurança   | Autenticação, autorização, validação de entrada              |
| Qualidade   | Testes, tratamento de erros, logging                         |

## Status

| Fase   | Escopo                                                      | Status    |
| ------ | ----------------------------------------------------------- | --------- |
| Fase 1 | Decisões estruturais e convenções base                      | Concluída |
| Fase 2 | Contratos de API e padrões por módulo                       | Concluída |
| Fase 3 | Documentação de domínio (eventos, inscrições, certificados) | Concluída |

## Como usar

1. Criar um novo `.md` neste diretório para cada conjunto de decisões (ex.: `decisoes-de-api.md`).
2. Incluir o cabeçalho obrigatório (versão, data, autor, revisores) em todo documento.
3. Marcar itens pendentes como **A definir** até serem fechados em reunião ou PR.
4. Atualizar versão, data e revisores no cabeçalho ao fechar decisões.
5. Não remover decisões antigas — atualizar o status ou registrar a revisão no conteúdo.
