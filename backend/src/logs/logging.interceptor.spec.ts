import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { LogsService } from './logs.service';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logsServiceMock: jest.Mocked<LogsService>;
  let registrarAssincronoMock: jest.Mock;

  beforeEach(() => {
    registrarAssincronoMock = jest.fn().mockResolvedValue(undefined);
    logsServiceMock = {
      registrarAssincrono: registrarAssincronoMock,
      listarRecentes: jest.fn(),
    } as unknown as jest.Mocked<LogsService>;

    interceptor = new LoggingInterceptor(logsServiceMock);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'deve registrar requisicao mutatoria com metodo %s',
    async (metodo) => {
      const mockRequest = {
        method: metodo,
        url: `/recurso-${metodo.toLowerCase()}`,
        user: { id_usuario: 1, email: 'admin@acadevent.edu.br' },
      };
      const mockResponse = {
        statusCode: 200,
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ success: true }),
      };

      await firstValueFrom(interceptor.intercept(mockContext, mockCallHandler));

      expect(registrarAssincronoMock).toHaveBeenCalledTimes(1);
      expect(registrarAssincronoMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metodo,
          url: `/recurso-${metodo.toLowerCase()}`,
          status_code: 200,
          usuario_id: 1,
        }),
      );
    },
  );

  it('deve normalizar metodo em caixa baixa para caixa alta ao auditar', async () => {
    const mockRequest = {
      method: 'post',
      url: '/eventos',
      user: { id_usuario: 3 },
    };
    const mockResponse = {
      statusCode: 201,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ success: true }),
    };

    await firstValueFrom(interceptor.intercept(mockContext, mockCallHandler));

    expect(registrarAssincronoMock).toHaveBeenCalledTimes(1);
    expect(registrarAssincronoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metodo: 'POST',
        url: '/eventos',
        status_code: 201,
        usuario_id: 3,
      }),
    );
  });

  it('deve registrar requisicao mutatoria sem usuario autenticado (request.user indefinido)', async () => {
    const mockRequest = {
      method: 'POST',
      url: '/eventos',
      user: undefined,
    };
    const mockResponse = {
      statusCode: 201,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ success: true }),
    };

    await firstValueFrom(interceptor.intercept(mockContext, mockCallHandler));

    expect(registrarAssincronoMock).toHaveBeenCalledTimes(1);
    expect(registrarAssincronoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metodo: 'POST',
        url: '/eventos',
        status_code: 201,
        usuario_id: undefined,
      }),
    );
  });

  it('nao deve registrar requisicoes somente de leitura (GET)', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/eventos',
    };
    const mockResponse = {
      statusCode: 200,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of([{ id: 1 }]),
    };

    await firstValueFrom(interceptor.intercept(mockContext, mockCallHandler));

    expect(registrarAssincronoMock).not.toHaveBeenCalled();
  });

  it('deve auditar requisicao mutatoria que falha com HttpException e propagar o erro', async () => {
    const mockRequest = {
      method: 'POST',
      url: '/eventos',
      user: { id_usuario: 2 },
    };
    const mockResponse = {
      statusCode: 200,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () =>
        throwError(() => new BadRequestException('Parametros invalidos')),
    };

    await expect(
      firstValueFrom(interceptor.intercept(mockContext, mockCallHandler)),
    ).rejects.toThrow(BadRequestException);

    expect(registrarAssincronoMock).toHaveBeenCalledTimes(1);
    expect(registrarAssincronoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metodo: 'POST',
        url: '/eventos',
        status_code: 400,
        usuario_id: 2,
      }),
    );
  });

  it('deve auditar requisicao mutatoria que falha com Error generico usando status 500 e propagar o erro', async () => {
    const mockRequest = {
      method: 'DELETE',
      url: '/eventos/1',
      user: { id_usuario: 5 },
    };
    const mockResponse = {
      statusCode: 200,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => new Error('Falha inesperada no banco')),
    };

    await expect(
      firstValueFrom(interceptor.intercept(mockContext, mockCallHandler)),
    ).rejects.toThrow('Falha inesperada no banco');

    expect(registrarAssincronoMock).toHaveBeenCalledTimes(1);
    expect(registrarAssincronoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metodo: 'DELETE',
        url: '/eventos/1',
        status_code: 500,
        usuario_id: 5,
      }),
    );
  });

  it('deve usar response.statusCode quando erro nao e HttpException e response.statusCode >= 400', async () => {
    const mockRequest = {
      method: 'PATCH',
      url: '/eventos/1',
      user: { id_usuario: 7 },
    };
    const mockResponse = {
      statusCode: 502,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => 'string-error'),
    };

    await expect(
      firstValueFrom(interceptor.intercept(mockContext, mockCallHandler)),
    ).rejects.toBe('string-error');

    expect(registrarAssincronoMock).toHaveBeenCalledTimes(1);
    expect(registrarAssincronoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metodo: 'PATCH',
        url: '/eventos/1',
        status_code: 502,
        usuario_id: 7,
      }),
    );
  });
});
