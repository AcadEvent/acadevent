const { test } = require('node:test');
const assert = require('node:assert/strict');
const { renderReport, main } = require('./test-report.cjs');
const metadata = { date: '2026-09-29T12:00:00Z', commit: 'abc123', node: 'v22', platform: 'win32' };

test('falha na inicialização aparece como reprovação mesmo sem JSON do Jest', () => {
  const report = renderReport([{ project: 'backend', ok: false, error: 'Dependência ausente', seconds: '0.01' }], metadata);
  assert.match(report, /REPROVADO/);
  assert.match(report, /Dependência ausente/);
  assert.match(report, /N\/D/);
});

test('relatório preserva falhas, testes pendentes e caracteres de tabela', () => {
  const report = renderReport([{ project: 'frontend', ok: false, seconds: '1.00', jest: {
    numPassedTestSuites: 0, numTotalTestSuites: 1, numPassedTests: 1, numFailedTests: 1, numPendingTests: 1, numTodoTests: 1,
    testResults: [{ name: 'example.test.ts', message: 'Erro\nDetalhe', assertionResults: [{ fullName: 'cenário | rejeitado', status: 'failed' }] }],
  } }], metadata);
  assert.match(report, /\| 1 \| 1 \| 2 \|/);
  assert.ok(report.includes('cenário \\| rejeitado'));
  assert.match(report, /Erro<br>Detalhe/);
});

test('projeto inválido falha antes de executar suítes', () => {
  assert.equal(main(['inexistente']), 1);
});
