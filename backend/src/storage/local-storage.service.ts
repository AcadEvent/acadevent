import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  ArquivoSalvo,
  ArquivoUpload,
  StorageServiceBase,
} from './storage.interface';

@Injectable()
export class LocalStorageService extends StorageServiceBase {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    super();
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async salvarArquivo(
    arquivo: ArquivoUpload,
    subpasta = 'geral',
  ): Promise<ArquivoSalvo> {
    const destinoPasta = path.join(this.uploadDir, subpasta);
    if (!fs.existsSync(destinoPasta)) {
      fs.mkdirSync(destinoPasta, { recursive: true });
    }

    const extensao = path.extname(arquivo.originalname);
    const hash = crypto.randomBytes(12).toString('hex');
    const nomeArmazenado = `${Date.now()}-${hash}${extensao}`;
    const caminhoFinal = path.join(destinoPasta, nomeArmazenado);

    await fs.promises.writeFile(caminhoFinal, arquivo.buffer);

    const caminhoRelativo = path
      .join(subpasta, nomeArmazenado)
      .replace(/\\/g, '/');
    const url = `/storage/arquivos/${caminhoRelativo}`;

    this.logger.log(`Arquivo salvo localmente: ${caminhoFinal}`);

    return {
      nome_original: arquivo.originalname,
      nome_armazenado: nomeArmazenado,
      caminho_relativo: caminhoRelativo,
      mimetype: arquivo.mimetype,
      tamanho_bytes: arquivo.size,
      url,
    };
  }

  async excluirArquivo(caminhoRelativo: string): Promise<boolean> {
    const caminhoFinal = path.join(this.uploadDir, caminhoRelativo);
    if (fs.existsSync(caminhoFinal)) {
      await fs.promises.unlink(caminhoFinal);
      return true;
    }
    return false;
  }
}
