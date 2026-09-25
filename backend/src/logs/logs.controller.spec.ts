import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { ListarLogsDto } from './dto/listar-logs.dto';

describe('LogsController', () => {
  let controller: LogsController;
  let listarRecentesMock: jest.Mock;

  beforeEach(async () => {
    listarRecentesMock = jest.fn().mockResolvedValue([]);
    const logsServiceMock = {
      registrarAssincrono: jest.fn(),
      listarRecentes: listarRecentesMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        {
          provide: LogsService,
          useValue: logsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<LogsController>(LogsController);
  });

  it('deve repassar o limite informado para logsService.listarRecentes', async () => {
    const query: ListarLogsDto = { limite: 50 };
    await controller.listarLogs(query);

    expect(listarRecentesMock).toHaveBeenCalledWith(50);
  });

  it('deve usar o limite padrao (100) quando query.limite for indefinido', async () => {
    const query: ListarLogsDto = {};
    await controller.listarLogs(query);

    expect(listarRecentesMock).toHaveBeenCalledWith(100);
  });

  it('deve usar o limite padrao (100) quando query for vazia ou undefined', async () => {
    await controller.listarLogs({ limite: undefined });

    expect(listarRecentesMock).toHaveBeenCalledWith(100);
  });

  it('deve aplicar clamping ao teto de 500 se o limite exceder', async () => {
    const query: ListarLogsDto = { limite: 600 };
    await controller.listarLogs(query);

    expect(listarRecentesMock).toHaveBeenCalledWith(500);
  });

  it('deve aplicar clamping ao piso de 1 se o limite for menor que 1', async () => {
    const query: ListarLogsDto = { limite: -10 };
    await controller.listarLogs(query);

    expect(listarRecentesMock).toHaveBeenCalledWith(1);
  });

  it('deve aplicar clamping ao piso de 1 se o limite for 0', async () => {
    const query: ListarLogsDto = { limite: 0 };
    await controller.listarLogs(query);

    expect(listarRecentesMock).toHaveBeenCalledWith(1);
  });
});
