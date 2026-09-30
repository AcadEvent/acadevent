const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const projects = ['backend', 'frontend'];
const cell = (value) => String(value ?? '').replace(/\x1b\[[0-9;]*m/g, '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');

function renderReport(results, metadata) {
  const lines = [
    '# Relatório de testes — AcadEvent', '',
    'Versão: 1.0', `Data: ${metadata.date.slice(0, 10)}`,
    'Autor: Gerador automatizado (QA)', 'Revisores: —', '', '---', '',
    `Execução: ${metadata.date}`, `Base Git: ${metadata.commit} (alterações locais podem estar presentes)`,
    `Ambiente: Node ${metadata.node}; ${metadata.platform}`, '',
    '## Resultado', '',
    '| Projeto | Situação | Suítes aprovadas/total | Testes aprovados | Falhos | Pendentes | Tempo (s) |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const r of results) {
    const j = r.jest;
    lines.push(`| ${r.project} | ${r.ok ? 'APROVADO' : 'REPROVADO'} | ${j?.numPassedTestSuites ?? 0}/${j?.numTotalTestSuites ?? 0} | ${j?.numPassedTests ?? 0} | ${j?.numFailedTests ?? 0} | ${(j?.numPendingTests ?? 0) + (j?.numTodoTests ?? 0)} | ${r.seconds} |`);
  }
  lines.push('', '## Cobertura de código', '',
    'Inclui arquivos de produção mesmo quando não possuem testes. Cobertura não comprova correção das regras de negócio.', '',
    '| Projeto | Instruções (%) | Ramos (%) | Funções (%) | Linhas (%) |', '| --- | --- | --- | --- | --- |');
  for (const r of results) {
    const c = r.coverage?.total;
    lines.push(`| ${r.project} | ${c?.statements.pct ?? 'N/D'} | ${c?.branches.pct ?? 'N/D'} | ${c?.functions.pct ?? 'N/D'} | ${c?.lines.pct ?? 'N/D'} |`);
  }
  lines.push('', '## Escopo e limites', '',
    'Jest executa testes unitários de serviços e clientes, além de testes HTTP isolados existentes com Supertest. Prisma, rede e dados de demonstração são simulados. As suítes backend/test/*.e2e-spec.ts não integram esta execução.', '',
    'Não valida PostgreSQL real, procedures, concorrência no banco, serviços externos ou navegação no navegador. Módulos ainda não implementados não são certificados por este relatório. Consulte docs/modulo-testes.md para a matriz de requisitos e comandos.', '',
    '## Casos executados', '', '| Projeto | Arquivo | Cenário | Resultado |', '| --- | --- | --- | --- |');
  for (const r of results) {
    for (const suite of r.jest?.testResults ?? []) {
      const file = path.relative(root, suite.name).split(path.sep).join('/');
      for (const test of suite.assertionResults ?? []) {
        lines.push(`| ${r.project} | ${cell(file)} | ${cell(test.fullName)} | ${cell(test.status)} |`);
      }
    }
  }
  lines.push('', '## Falhas e erros de execução', '');
  const failures = [];
  for (const r of results) {
    if (r.error) failures.push(`${r.project}: ${r.error}`);
    for (const suite of r.jest?.testResults ?? []) {
      if (suite.message) failures.push(`${r.project}: ${suite.message}`);
    }
  }
  lines.push(failures.length ? failures.map((f) => `- ${cell(f)}`).join('\n') : 'Nenhuma falha registrada.', '');
  return lines.join('\n');
}

function runProject(project) {
  const directory = path.join(root, project);
  const output = path.join(root, 'reports', project);
  fs.mkdirSync(output, { recursive: true });
  const jsonFile = path.join(output, 'jest-results.json');
  const coverageFile = path.join(output, 'coverage', 'coverage-summary.json');
  // Nunca reaproveitar um resultado de execução anterior.
  for (const file of [jsonFile, coverageFile]) fs.rmSync(file, { force: true });
  const started = Date.now();
  let result;
  let error;
  try {
    const jestBin = require.resolve('jest/bin/jest', { paths: [directory] });
    result = spawnSync(process.execPath, [jestBin, '--ci', '--runInBand', '--coverage',
      '--coverageReporters=text', '--coverageReporters=html', '--coverageReporters=json-summary',
      '--coverageReporters=lcov', `--coverageDirectory=${path.join(output, 'coverage')}`,
      '--json', `--outputFile=${jsonFile}`], { cwd: directory, stdio: 'inherit' });
    if (result.error) error = result.error.message;
    else if (result.status !== 0) error = `Jest terminou com código ${result.status}; sinal ${result.signal ?? 'nenhum'}.`;
  } catch (e) {
    error = `Não foi possível executar Jest. Instale as dependências de ${project} com npm ci. ${e.message}`;
  }
  let jest;
  let coverage;
  try {
    if (fs.existsSync(jsonFile)) jest = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    if (fs.existsSync(coverageFile)) coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  } catch (e) { error = `Resultado inválido: ${e.message}`; }
  return { project, ok: !error && result?.status === 0 && jest?.success === true && jest.numTotalTests > 0 && Boolean(coverage),
    error: error ?? (!jest || !coverage ? 'Resultado ou cobertura ausente.' : undefined),
    seconds: ((Date.now() - started) / 1000).toFixed(2), jest, coverage };
}

function main(args) {
  if (args.length > 1 || (args[0] && !projects.includes(args[0]))) {
    console.error('Uso: node scripts/test-report.cjs [backend|frontend]');
    return 1;
  }
  const selected = args.length ? args : projects;
  const results = selected.map(runProject);
  const git = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' });
  const metadata = { date: new Date().toISOString(), commit: git.stdout?.trim() || 'indisponível', node: process.version, platform: process.platform };
  const output = path.join(root, 'reports');
  const suffix = args.length ? `-${args[0]}` : '';
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, `relatorio-testes${suffix}.md`), renderReport(results, metadata));
  fs.writeFileSync(path.join(output, `resumo${suffix}.json`), JSON.stringify({ metadata, results }, null, 2));
  console.log(`Relatório: reports/relatorio-testes${suffix}.md`);
  return results.every((r) => r.ok) ? 0 : 1;
}

module.exports = { renderReport, main };
if (require.main === module) process.exitCode = main(process.argv.slice(2));
