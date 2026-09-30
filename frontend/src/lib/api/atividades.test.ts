import {
  criarAtividade, emitirCertificado, ErroApi, getCronograma,
  inscreverAtividade, registrarChamada, urlDownloadCertificado, validarCertificado,
} from './atividades';

describe('RF05 / RF11 - contratos da API de atividades e certificados', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);
  });
  afterEach(() => jest.restoreAllMocks());

  function responder(data: unknown, status = 200) {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(data), {
      status, headers: { 'Content-Type': 'application/json' },
    }));
  }

  it('cronograma ordena horários de reservas e preserva privacidade do ministrante', async () => {
    responder([
      { id_atividade: 2, titulo: 'Oficina', tipo_atividade: 'Oficina', data_abertura_atividade: '2026-10-01T14:00:00Z' },
      { id_atividade: 1, titulo: 'Mesa', tipo_atividade: 'Mesa Redonda', reservas: [{ data_inicio: '2026-10-01T10:00:00Z', data_final: '2026-10-01T12:00:00Z', espaco: { nome_sala: 'Sala A', capacidade_max: 20 } }], atividadesMinistrantes: [{ ministrante: { id_ministrante: 3, usuario: { nome: 'Docente', email: 'privado@example.com' } } }] },
    ]);
    const result = await getCronograma(1);
    expect(result.map((a) => a.id)).toEqual(['1', '2']);
    expect(result[0]).toMatchObject({ tipo: 'mesa_redonda', local: 'Sala A', capacidade: 20, ministrantesIds: ['3'] });
    expect(result[1].tipo).toBe('workshop');
    expect(JSON.stringify(result)).not.toContain('privado@example.com');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/atividades/cronograma/edicao/1'), { cache: 'no-store' });
  });

  it('falha de rede no cronograma não é apresentada como lista vazia', async () => {
    responder({}, 500);
    await expect(getCronograma(1)).rejects.toThrow('Não foi possível carregar o cronograma.');
  });

  it('inscrição envia Bearer e identificador da atividade', async () => {
    responder({ status: 'Inscrito' }, 201);
    await expect(inscreverAtividade('token-teste', 2)).resolves.toEqual({ status: 'Inscrito' });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/atividades/inscrever'), expect.objectContaining({
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-teste' }, body: JSON.stringify({ id_atividade: 2 }),
    }));
  });

  it('conflito preserva código 409 e mensagem para o participante', async () => {
    responder({ message: ['Conflito de horário', 'Escolha outra atividade'] }, 409);
    await expect(inscreverAtividade('token', 2)).rejects.toMatchObject({ status: 409, message: 'Conflito de horário Escolha outra atividade' });
  });

  it('resposta de erro não JSON preserva status HTTP', async () => {
    fetchMock.mockResolvedValue(new Response('Indisponível', { status: 503 }));
    await expect(inscreverAtividade('token', 2)).rejects.toEqual(new ErroApi('Falha na operação.', 503));
  });

  it('cadastro traduz os dados da interface para o contrato do backend', async () => {
    responder({ id_atividade: 2 }, 201);
    await criarAtividade('token', { idEdicao: 1, titulo: 'Curso', cargaHoraria: 4 });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/atividades'), expect.objectContaining({ body: JSON.stringify({ id_edicao: 1, titulo: 'Curso', carga_horario: 4 }) }));
  });

  it('chamada envia presença e ausência no DTO estruturado', async () => {
    responder({ count: 2 }, 201);
    await registrarChamada('token', [{ idInscricaoAtividade: 1, status: 'Presente' }, { idInscricaoAtividade: 2, status: 'Ausente' }]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/atividades/chamada'), expect.objectContaining({ body: JSON.stringify({ presencas: [{ id_inscricao_atividade: 1, status: 'Presente' }, { id_inscricao_atividade: 2, status: 'Ausente' }] }) }));
  });

  it('emissão para o usuário autenticado omite beneficiário quando não informado', async () => {
    responder({ codigo_autenticidade: 'AUTH-1' }, 201);
    await emitirCertificado('token', { idEdicao: 1, idAtividade: 2 });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/certificados/atividade'), expect.objectContaining({ body: JSON.stringify({ id_edicao: 1, id_atividade: 2 }) }));
  });

  it.each([{ valido: false }, { valido: true, certificado: null }])('não considera válido certificado sem dados: %j', async (data) => {
    responder(data);
    await expect(validarCertificado('AUTH-1')).resolves.toEqual({ valido: false });
  });

  it('certificado inexistente retorna inválido', async () => {
    responder({}, 404);
    await expect(validarCertificado('AUTH-1')).resolves.toEqual({ valido: false });
  });

  it('erro do servidor ao validar certificado é propagado', async () => {
    responder({}, 500);
    await expect(validarCertificado('AUTH-1')).rejects.toThrow('Não foi possível validar o certificado.');
  });

  it('validação mapeia beneficiário, evento e carga horária', async () => {
    responder({ valido: true, certificado: { codigo_autenticidade: 'AUTH-1', usuario: { nome: 'Aluno', email: 'a***o@example.com' }, edicao: { titulo_oficial: 'Congresso' }, atividade: { titulo: 'Curso', carga_horario: 4 } } });
    await expect(validarCertificado('AUTH-1')).resolves.toMatchObject({ valido: true, certificado: { nomeParticipante: 'Aluno', evento: 'Congresso', atividade: 'Curso', cargaHoraria: 4 } });
  });

  it('código com caracteres especiais é codificado nas URLs públicas', async () => {
    responder({}, 404);
    await validarCertificado('AUTH/a b');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/certificados/AUTH%2Fa%20b/validar'), { cache: 'no-store' });
    expect(urlDownloadCertificado('AUTH/a b')).toContain('/certificados/AUTH%2Fa%20b/download');
  });
});
