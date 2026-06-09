# Documentação do Backend — AcadEvent

Versão: 0.1  
Data: 2026-06-09  
Autor: João Vitor Antunes da Silva (SPM)  
Revisores: —

---

Decisões de arquitetura, API e padrões de desenvolvimento da camada de lógica de negócio. Este diretório registra o que foi acordado pelo time para manter consistência técnica e facilitar a evolução do backend.

A formatação destes documentos segue o [padrão de documentação do projeto](../../docs/padrao-de-documentacao.md).

## Objetivo

Centralizar decisões que impactam a API REST, o modelo de dados, a organização de módulos e as convenções de código do NestJS — evitando rediscussões e garantindo alinhamento entre squads.

## Documentos

| Documento | Conteúdo |
| --- | --- |
| _A definir_ | — |

## Escopo deste diretório

| Tema | Exemplos do que documentar |
| --- | --- |
| Arquitetura | Package by Feature, camadas, contratos entre módulos |
| API | Versionamento, formatos de resposta, códigos HTTP, paginação |
| Dados | Convenções Prisma, migrações, nomenclatura de entidades |
| Segurança | Autenticação, autorização, validação de entrada |
| Qualidade | Testes, tratamento de erros, logging |

## Status

| Fase | Escopo | Status |
| --- | --- | --- |
| Fase 1 | Decisões estruturais e convenções base | Em definição |
| Fase 2 | Contratos de API e padrões por módulo | Planejada |
| Fase 3 | Documentação de domínio (eventos, inscrições, certificados) | Planejada |

## Como usar

1. Criar um novo `.md` neste diretório para cada conjunto de decisões (ex.: `decisoes-de-api.md`).
2. Incluir o cabeçalho obrigatório (versão, data, autor, revisores) em todo documento.
3. Marcar itens pendentes como **A definir** até serem fechados em reunião ou PR.
4. Atualizar versão, data e revisores no cabeçalho ao fechar decisões.
5. Não remover decisões antigas — atualizar o status ou registrar a revisão no conteúdo.
