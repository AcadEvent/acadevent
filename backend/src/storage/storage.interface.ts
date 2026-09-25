export interface ArquivoSalvo {
  nome_original: string;
  nome_armazenado: string;
  caminho_relativo: string;
  mimetype: string;
  tamanho_bytes: number;
  url: string;
}

export interface ArquivoUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
  salvarArquivo(
    arquivo: ArquivoUpload,
    subpasta?: string,
  ): Promise<ArquivoSalvo>;
  excluirArquivo(caminhoRelativo: string): Promise<boolean>;
}

export abstract class StorageServiceBase implements IStorageService {
  abstract salvarArquivo(
    arquivo: ArquivoUpload,
    subpasta?: string,
  ): Promise<ArquivoSalvo>;
  abstract excluirArquivo(caminhoRelativo: string): Promise<boolean>;
}
