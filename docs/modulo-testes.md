# Módulo de testes e relatório — Item 12

Versão: 1.0
Data: 2026-09-29
Autor: Codex (apoio à implementação e QA)
Revisores: —

---

## Objetivo

Verificar os casos de uso implementados por meio de cenários de sucesso, rejeição, autorização e valores de fronteira. O framework adotado é Jest, com ts-jest para TypeScript, Nest Testing para injeção de dependências e Supertest nos testes HTTP isolados existentes.

## Preparação e execução

Utilize Node.js 22.12 ou superior (CI utiliza Node 24). A partir da raiz:

```sh
npm --prefix backend ci
cd backend
npx prisma generate
cd ..
npm --prefix frontend ci
npm run test:runner
npm run test:report
```

Para gerar o Prisma Client, prefira executar `npx prisma generate` dentro de `backend`, onde se encontra `prisma.config.ts`. A geração não conecta ao banco. Não é necessário iniciar Docker, PostgreSQL ou fornecer credenciais reais para as suítes deste módulo. No PowerShell com scripts bloqueados, use `npm.cmd` e `npx.cmd`.

Comandos por camada, na raiz:

```sh
npm run test:report:backend
npm run test:report:frontend
```

Dentro de cada camada, `npm test` mantém a execução interativa usual e `npm run test:report` gera o relatório apenas daquele projeto. O comando da raiz executa ambas as camadas mesmo se uma falhar e retorna código 1 quando houver reprovação, erro de inicialização ou ausência de resultados/cobertura. Os testes do gerador são executados separadamente com `npm run test:runner`.

## Artefatos

| Arquivo | Conteúdo |
| --- | --- |
| `reports/relatorio-testes.md` | Resultado consolidado, ambiente, base Git, totais, cobertura, cenários e falhas |
| `reports/resumo.json` | Evidência estruturada da execução consolidada |
| `reports/<projeto>/jest-results.json` | Resultados brutos do Jest por suíte e caso |
| `reports/<projeto>/coverage/index.html` | Cobertura navegável por arquivo |
| `reports/<projeto>/coverage/coverage-summary.json` | Percentuais de instruções, ramos, funções e linhas |
| `reports/<projeto>/coverage/lcov.info` | Cobertura para ferramentas de análise |

Execuções por camada usam `relatorio-testes-backend.md` / `relatorio-testes-frontend.md` e `resumo-backend.json` / `resumo-frontend.json`. Os resultados brutos anteriores são descartados antes de cada execução para evitar apresentar evidências antigas como atuais. Artefatos em `reports/` são ignorados no Git. A evidência desta entrega está em [relatorio-testes.md](./relatorio-testes.md); gere novos resultados após modificar o código.

## Matriz de rastreabilidade

Os identificadores RF abaixo vêm de [acad_event_requirements.md](../frontend/docs/acad_event_requirements.md). A associação indica cenários testados, sem afirmar que todos os subrequisitos de cada RF estão implementados.

| Requisito | Caso de uso / cenários verificados | Suítes principais |
| --- | --- | --- |
| RF01 | Criar, consultar e alterar status de evento; datas inválidas, slug duplicado, propriedade do evento | `backend/src/eventos/eventos.service.spec.ts` |
| RF02 / RNF03 | Cadastro e login, e-mail duplicado, senha inválida, JWT e papéis | `backend/src/auth/**/*.spec.ts` |
| RF04 | Inscrição em edição, lote fechado/esgotado, cupom de outra edição, gratuidade, QR e repetição de check-in | `backend/src/inscricoes/*.spec.ts` |
| RF04 / RF13 | Confirmação e webhook de pagamento, idempotência, estorno e resumo financeiro | `backend/src/pagamentos/pagamentos.service.spec.ts`; `frontend/src/app/(gerenciar)/gerenciar/[slug]/inscricoes/gestao.test.ts` |
| RF05 | Cadastro de atividade, associação de ministrante, inscrição duplicada, pré-condição financeira, lotação, sobreposição e horários consecutivos | `backend/src/atividades/atividades.service.spec.ts` |
| RF05.6 | Chamada por papéis autorizados, status inválido, lista vazia e prevenção de gravação parcial | `backend/src/atividades/atividades.service.spec.ts` |
| RF05.2 / RF14 | Cronograma ordenado, horários UTC, adaptação de reservas e privacidade do ministrante | `frontend/src/lib/api/atividades.test.ts`; `frontend/src/lib/datas.test.ts` |
| RF06 | Submissão e avaliação de trabalhos, permissões e tratamento de erros | `backend/src/submissoes/submissoes.service.spec.ts` |
| RF07 | Cadastro e reserva de espaço, permissões; tradução de erro de conflito da procedure | `backend/src/espacos/*.spec.ts`; `backend/src/prisma/map-procedure-error.spec.ts` |
| RF08 | Retirada e devolução de inventário, permissões e rejeição de devolução repetida | `backend/src/inventario/inventario.service.spec.ts` |
| RF09 | Comunicados, segmentação, histórico e autorização | `backend/src/comunicacao/comunicacao.service.spec.ts` |
| RF10 | Upload, download, arquivos e proteção contra travessia de diretórios | `backend/src/storage/*.spec.ts` |
| RF11 | Emissão, duplicidade, código de autenticidade, PDF e validação pública | `backend/src/certificados/certificados.service.spec.ts`; `frontend/src/lib/api/atividades.test.ts` |
| RF16 | Registro assíncrono, consulta administrativa e falhas HTTP | `backend/src/logs/*.spec.ts` |

## Estratégia e limites da certificação

Os testes de serviço substituem Prisma por mocks e verificam resultados, rejeições e ausência de gravações indevidas. Os testes HTTP isolados validam rotas e guards com dependências simuladas. Os testes de clientes substituem `fetch`; os testes de gestão existentes usam dados de demonstração, sem integração real com o backend.

O backend mede os arquivos de produção em `src`, excluindo testes, DTOs, módulos declarativos e bootstrap. O frontend mede clientes da API, ações e utilitários de datas, incluindo arquivos desses grupos sem testes. Páginas e componentes React não integram essa medição. Não há limiar artificial de aprovação por cobertura: percentuais são evidência complementar aos cenários.

As procedures SQL de inscrição, reserva e certificação não são executadas pelos mocks. Esta entrega não comprova persistência, rollback real, integridade referencial, concorrência, envio real de e-mail, gateway, UI no navegador ou RFs não implementados. As suítes em `backend/test` requerem ambiente próprio e podem ser executadas separadamente com `npm run test:e2e`; não integram o relatório unitário.

## Integração contínua

Os workflows existentes de backend e frontend executam `test:report`. Os artefatos são publicados no GitHub Actions mesmo quando os testes falham (`if: always()`), e o job continua sinalizando reprovação. Não foi feita publicação remota nesta implementação.
