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

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logs: RegistroLog[] = [];
  private readonly maxLogs = 500;

  async registrarAssincrono(logData: Omit<RegistroLog, 'id_log'>): Promise<void> {
    // Processamento assincrono nao-bloqueante
    setImmediate(() => {
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
    });
  }

  async listarRecentes(limite = 100): Promise<RegistroLog[]> {
    return this.logs.slice(0, limite);
  }
}
