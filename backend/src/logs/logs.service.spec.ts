import { Test, TestingModule } from '@nestjs/testing';
import { LogsService } from './logs.service';

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

    // Aguarda ciclo de microtask / setImmediate
    await new Promise((r) => setTimeout(r, 50));

    const logs = await service.listarRecentes(10);
    expect(logs).toHaveLength(1);
    expect(logs[0].metodo).toBe('GET');
    expect(logs[0].url).toBe('/eventos');
  });
});
