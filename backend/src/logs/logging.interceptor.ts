import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from './logs.service';

interface RequestComUsuario extends Request {
  user?: {
    id_usuario?: number;
    email?: string;
    perfis?: string[];
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private static readonly METODOS_MUTATORIOS = new Set([
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ]);

  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestComUsuario>();
    const response = httpContext.getResponse<Response>();

    const metodo = request.method?.toUpperCase();
    if (!metodo || !LoggingInterceptor.METODOS_MUTATORIOS.has(metodo)) {
      return next.handle();
    }

    const inicio = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.registrarLog(
            request,
            response.statusCode,
            Date.now() - inicio,
            metodo,
          );
        },
        error: (error: unknown) => {
          const statusCode =
            error instanceof HttpException
              ? error.getStatus()
              : response.statusCode >= 400
                ? response.statusCode
                : HttpStatus.INTERNAL_SERVER_ERROR;
          this.registrarLog(request, statusCode, Date.now() - inicio, metodo);
        },
      }),
    );
  }

  private registrarLog(
    request: RequestComUsuario,
    statusCode: number,
    duracao: number,
    metodo: string,
  ): void {
    const usuarioId = request.user?.id_usuario;

    void this.logsService.registrarAssincrono({
      metodo,
      url: request.originalUrl || request.url,
      status_code: statusCode,
      duracao_ms: duracao,
      data: new Date(),
      ip: request.ip || '127.0.0.1',
      usuario_id: usuarioId,
    });
  }
}
