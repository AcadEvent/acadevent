import { Injectable, Logger } from '@nestjs/common';

export interface RegistroLog {
  id_log: string;
  metodo: string;
  url: string;
  status_code: number;
  duracao_ms: number;
  data: Date;
  ip: string;
  usuario_id?: number;
}

/**
 * [RF16.1 / RF16.2 / Arquitetura]: No Marco P3, o armazenamento de auditoria opera via
 * buffer circular em memória assíncrono (não-bloqueante via setImmediate) para prototipação
 * e validação de requisitos sem introdução de dependências de infraestrutura NoSQL. No Marco
 * P4, esta classe será desacoplada via Adapter para persistência externa (MongoDB ou Redis Stream/Document).
 */
@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logs: RegistroLog[] = [];
  private readonly maxLogs = 500;

  registrarAssincrono(logData: Omit<RegistroLog, 'id_log'>): Promise<void> {
    // Processamento assincrono nao-bloqueante
    setImmediate(() => {
      try {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const novoRegistro: RegistroLog = {
          id_log: id,
          ...logData,
        };

        this.logs.unshift(novoRegistro);
        if (this.logs.length > this.maxLogs) {
          this.logs.pop();
        }

        this.logger.log(
          `[AUDIT] ${novoRegistro.metodo} ${novoRegistro.url} - Status: ${novoRegistro.status_code} (${novoRegistro.duracao_ms}ms)`,
        );
      } catch (error) {
        this.logger.error('Falha ao processar log assincrono', error);
      }
    });
    return Promise.resolve();
  }

  listarRecentes(limite = 100): Promise<RegistroLog[]> {
    return Promise.resolve(this.logs.slice(0, limite));
  }
}
