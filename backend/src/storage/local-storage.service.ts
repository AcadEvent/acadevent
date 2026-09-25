import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
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
    let decodedSubpasta = subpasta;
    try {
      decodedSubpasta = decodeURIComponent(subpasta);
    } catch {
      throw new ForbiddenException('Acesso negado.');
    }

    if (
      subpasta.includes('..') ||
      decodedSubpasta.includes('..') ||
      subpasta.toLowerCase().includes('%2e%2e') ||
      decodedSubpasta.includes('\0')
    ) {
      throw new ForbiddenException('Acesso negado.');
    }

    const destinoPasta = path.resolve(this.uploadDir, decodedSubpasta);
    if (
      !destinoPasta.startsWith(this.uploadDir + path.sep) &&
      destinoPasta !== this.uploadDir
    ) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (!fs.existsSync(destinoPasta)) {
      fs.mkdirSync(destinoPasta, { recursive: true });
    }

    const extensao = path.extname(arquivo.originalname);
    const hash = crypto.randomBytes(12).toString('hex');
    const nomeArmazenado = `${Date.now()}-${hash}${extensao}`;
    const caminhoFinal = path.join(destinoPasta, nomeArmazenado);

    await fs.promises.writeFile(caminhoFinal, arquivo.buffer);

    const caminhoRelativo = path
      .join(decodedSubpasta, nomeArmazenado)
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
    let decoded = caminhoRelativo;
    try {
      decoded = decodeURIComponent(caminhoRelativo);
    } catch {
      throw new ForbiddenException('Acesso negado.');
    }

    if (
      caminhoRelativo.includes('..') ||
      decoded.includes('..') ||
      caminhoRelativo.toLowerCase().includes('%2e%2e') ||
      decoded.includes('\0')
    ) {
      throw new ForbiddenException('Acesso negado.');
    }

    const caminhoFinal = path.resolve(this.uploadDir, decoded);
    if (!caminhoFinal.startsWith(this.uploadDir + path.sep)) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (fs.existsSync(caminhoFinal)) {
      await fs.promises.unlink(caminhoFinal);
      return true;
    }
    return false;
  }
}
