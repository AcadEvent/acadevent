import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LogsService, RegistroLog } from './logs.service';

describe('LogsService', () => {
  let service: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsService],
    }).compile();

    service = module.get<LogsService>(LogsService);
  });

  it('deve registrar log assincronamente e permitir listagem', async () => {
    await service.registrarAssincrono({
      metodo: 'GET',
      url: '/eventos',
      status_code: 200,
      duracao_ms: 12,
      data: new Date(),
      ip: '127.0.0.1',
    });

    // Aguarda processamento do setImmediate sem timer arbitrario
    await new Promise((r) => setImmediate(r));

    const logs = await service.listarRecentes(10);
    expect(logs).toHaveLength(1);
    expect(logs[0].metodo).toBe('GET');
    expect(logs[0].url).toBe('/eventos');
  });

  it('deve respeitar a capacidade maxima do buffer circular (500) e descartar os registros mais antigos ao transbordar', async () => {
    for (let i = 1; i <= 505; i++) {
      void service.registrarAssincrono({
        metodo: 'POST',
        url: `/eventos/${i}`,
        status_code: 200,
        duracao_ms: 10,
        data: new Date(),
        ip: '127.0.0.1',
      });
    }

    // Aguarda execucao de todos os callbacks enfileirados via setImmediate
    await new Promise((r) => setImmediate(r));

    const logs = await service.listarRecentes(600);
    expect(logs).toHaveLength(500);

    // O mais recente deve ser o 505 (no topo)
    expect(logs[0].url).toBe('/eventos/505');

    // O mais antigo ainda presente deve ser o 6 (no final da lista)
    expect(logs[499].url).toBe('/eventos/6');

    // Os 5 mais antigos (/eventos/1 a /eventos/5) devem ter sido ejetados
    const urls = logs.map((l) => l.url);
    expect(urls).not.toContain('/eventos/1');
    expect(urls).not.toContain('/eventos/2');
    expect(urls).not.toContain('/eventos/3');
    expect(urls).not.toContain('/eventos/4');
    expect(urls).not.toContain('/eventos/5');
  });

  it('deve capturar erro e registrar no logger.error se ocorrer falha no setImmediate', async () => {
    const serviceInternal = service as unknown as {
      logger: Logger;
      logs: RegistroLog[];
    };
    const errorSpy = jest
      .spyOn(serviceInternal.logger, 'error')
      .mockImplementation(() => {});
    jest.spyOn(serviceInternal.logs, 'unshift').mockImplementationOnce(() => {
      throw new Error('Falha simulada');
    });

    await service.registrarAssincrono({
      metodo: 'POST',
      url: '/erro',
      status_code: 500,
      duracao_ms: 5,
      data: new Date(),
      ip: '127.0.0.1',
    });

    await new Promise((r) => setImmediate(r));

    expect(errorSpy).toHaveBeenCalledWith(
      'Falha ao processar log assincrono',
      expect.any(Error),
    );
  });
});
