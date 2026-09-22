import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from './logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const inicio = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      tap(() => {
        const duracao = Date.now() - inicio;
        const usuarioId = request.user?.id_usuario;

        this.logsService.registrarAssincrono({
          metodo: request.method,
          url: request.originalUrl || request.url,
          status_code: response.statusCode,
          duracao_ms: duracao,
          data: new Date(),
          ip: request.ip || '127.0.0.1',
          usuario_id: usuarioId,
        });
      }),
    );
  }
}
