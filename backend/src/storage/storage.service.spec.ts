import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { LocalStorageService } from './local-storage.service';
import { ArquivoUpload } from './storage.interface';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    promises: {
      ...actualFs.promises,
      writeFile: jest.fn().mockResolvedValue(undefined),
      unlink: jest.fn().mockResolvedValue(undefined),
    },
  };
});

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStorageService],
    }).compile();

    service = module.get<LocalStorageService>(LocalStorageService);
  });

  it('deve salvar arquivo e retornar metadados com url relativa', async () => {
    const mockFile: ArquivoUpload = {
      fieldname: 'file',
      originalname: 'artigo.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('conteudo de teste'),
    };

    const resultado = await service.salvarArquivo(mockFile, 'trabalhos');

    expect(resultado).toBeDefined();
    expect(resultado.nome_original).toBe('artigo.pdf');
    expect(resultado.mimetype).toBe('application/pdf');
    expect(resultado.url).toContain('/storage/arquivos/trabalhos/');
  });

  it('deve excluir arquivo se ele existir no disco', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    const excluiu = await service.excluirArquivo('trabalhos/arquivo.pdf');
    expect(excluiu).toBe(true);
    expect(fs.promises.unlink).toHaveBeenCalled();
  });
});
