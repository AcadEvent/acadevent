/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  INestApplication,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import request from 'supertest';
import { PassportModule } from '@nestjs/passport';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn(),
  };
});

import { StorageController } from './storage.controller';
import {
  STORAGE_SERVICE,
  StorageServiceBase,
  ArquivoUpload,
  ArquivoSalvo,
} from './storage.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

process.env.JWT_SECRET = 'test_secret_for_storage_controller_spec';

describe('StorageController', () => {
  let controller: StorageController;
  let mockStorageService: jest.Mocked<StorageServiceBase>;
  let app: INestApplication;

  beforeEach(async () => {
    mockStorageService = {
      salvarArquivo: jest.fn().mockImplementation((file: ArquivoUpload) => {
        return Promise.resolve<ArquivoSalvo>({
          nome_original: file.originalname,
          nome_armazenado: `stored-${file.originalname}`,
          caminho_relativo: `geral/stored-${file.originalname}`,
          mimetype: file.mimetype,
          tamanho_bytes: file.size,
          url: `/storage/arquivos/geral/stored-${file.originalname}`,
        });
      }),
      excluirArquivo: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [StorageController],
      providers: [
        JwtStrategy,
        {
          provide: STORAGE_SERVICE,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.restoreAllMocks();
  });

  describe('Path Traversal em obterArquivo', () => {
    it('deve lancar ForbiddenException quando subpasta ou nome contiver ".."', () => {
      const mockRes = { sendFile: jest.fn() } as unknown as Response;

      expect(() =>
        controller.obterArquivo('..', 'arquivo.pdf', mockRes),
      ).toThrow(ForbiddenException);
      expect(() =>
        controller.obterArquivo('geral', '../secret.txt', mockRes),
      ).toThrow(ForbiddenException);
      expect(() =>
        controller.obterArquivo('../geral', 'arquivo.pdf', mockRes),
      ).toThrow(ForbiddenException);
      expect(() =>
        controller.obterArquivo('geral', 'pasta/../../etc/passwd', mockRes),
      ).toThrow(ForbiddenException);
    });

    it('deve lancar ForbiddenException quando subpasta ou nome contiver "%2e%2e"', () => {
      const mockRes = { sendFile: jest.fn() } as unknown as Response;

      expect(() =>
        controller.obterArquivo('%2e%2e', 'arquivo.pdf', mockRes),
      ).toThrow(ForbiddenException);
      expect(() =>
        controller.obterArquivo('geral', '%2e%2e/secret.txt', mockRes),
      ).toThrow(ForbiddenException);
      expect(() =>
        controller.obterArquivo('%2e%2e%2fgeral', 'arquivo.pdf', mockRes),
      ).toThrow(ForbiddenException);
    });

    it('deve lancar ForbiddenException para caminhos que resolvam fora de uploads/', () => {
      const mockRes = { sendFile: jest.fn() } as unknown as Response;

      expect(() => controller.obterArquivo('/etc', 'passwd', mockRes)).toThrow(
        ForbiddenException,
      );
    });

    it('deve enviar arquivo se caminho for valido e existir', () => {
      const mockRes = { sendFile: jest.fn() } as unknown as Response;
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      controller.obterArquivo('geral', 'artigo.pdf', mockRes);

      expect(mockRes.sendFile).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'uploads', 'geral', 'artigo.pdf'),
      );
    });

    it('deve lancar NotFoundException se caminho for valido mas arquivo nao existir', () => {
      const mockRes = { sendFile: jest.fn() } as unknown as Response;
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() =>
        controller.obterArquivo('geral', 'nao-existe.pdf', mockRes),
      ).toThrow(NotFoundException);
    });
  });

  describe('Autenticação de Upload (Upload anônimo)', () => {
    it('deve ter o guard JwtAuthGuard aplicado ao endpoint uploadArquivo', () => {
      const guards =
        Reflect.getMetadata(
          '__guards__',
          StorageController.prototype.uploadArquivo,
        ) ?? Reflect.getMetadata('__guards__', controller.uploadArquivo);

      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });

    it('deve bloquear upload anonimo (sem token JWT) retornando 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/storage/upload')
        .attach('file', Buffer.from('conteudo'), 'documento.pdf')
        .expect(401);
    });
  });

  describe('Validação de Tipos de Arquivo no Upload', () => {
    it('deve rejeitar upload de arquivo .html com BadRequestException("Tipo de arquivo nao permitido.")', async () => {
      const mockFile: ArquivoUpload = {
        fieldname: 'file',
        originalname: 'malicioso.html',
        encoding: '7bit',
        mimetype: 'text/html',
        size: 512,
        buffer: Buffer.from('<html><script>alert(1)</script></html>'),
      };

      await expect(controller.uploadArquivo(mockFile)).rejects.toThrow(
        new BadRequestException('Tipo de arquivo nao permitido.'),
      );
    });

    it('deve rejeitar upload de arquivo .svg com scripts com BadRequestException("Tipo de arquivo nao permitido.")', async () => {
      const mockFile: ArquivoUpload = {
        fieldname: 'file',
        originalname: 'imagem.svg',
        encoding: '7bit',
        mimetype: 'image/svg+xml',
        size: 512,
        buffer: Buffer.from('<svg><script>alert(1)</script></svg>'),
      };

      await expect(controller.uploadArquivo(mockFile)).rejects.toThrow(
        new BadRequestException('Tipo de arquivo nao permitido.'),
      );
    });

    it('deve rejeitar upload de arquivo .exe com BadRequestException("Tipo de arquivo nao permitido.")', async () => {
      const mockFile: ArquivoUpload = {
        fieldname: 'file',
        originalname: 'virus.exe',
        encoding: '7bit',
        mimetype: 'application/x-msdownload',
        size: 2048,
        buffer: Buffer.from('MZ...'),
      };

      await expect(controller.uploadArquivo(mockFile)).rejects.toThrow(
        new BadRequestException('Tipo de arquivo nao permitido.'),
      );
    });

    it('deve rejeitar upload de arquivo .sh com BadRequestException("Tipo de arquivo nao permitido.")', async () => {
      const mockFile: ArquivoUpload = {
        fieldname: 'file',
        originalname: 'script.sh',
        encoding: '7bit',
        mimetype: 'application/x-sh',
        size: 256,
        buffer: Buffer.from('#!/bin/sh\nrm -rf /'),
      };

      await expect(controller.uploadArquivo(mockFile)).rejects.toThrow(
        new BadRequestException('Tipo de arquivo nao permitido.'),
      );
    });

    it('deve aceitar upload legítimo de arquivo .pdf', async () => {
      const mockFile: ArquivoUpload = {
        fieldname: 'file',
        originalname: 'artigo.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('%PDF-1.4...'),
      };

      const res = await controller.uploadArquivo(mockFile);
      expect(res).toBeDefined();
      expect(res.nome_original).toBe('artigo.pdf');
      expect(mockStorageService.salvarArquivo).toHaveBeenCalledWith(mockFile);
    });

    it('deve aceitar upload legítimo de arquivo .png', async () => {
      const mockFile: ArquivoUpload = {
        fieldname: 'file',
        originalname: 'foto.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 2048,
        buffer: Buffer.from('\x89PNG...'),
      };

      const res = await controller.uploadArquivo(mockFile);
      expect(res).toBeDefined();
      expect(res.nome_original).toBe('foto.png');
      expect(mockStorageService.salvarArquivo).toHaveBeenCalledWith(mockFile);
    });

    it('deve aceitar upload legítimo de arquivo .jpg', async () => {
      const mockFile: ArquivoUpload = {
        fieldname: 'file',
        originalname: 'banner.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 2048,
        buffer: Buffer.from('\xFF\xD8\xFF...'),
      };

      const res = await controller.uploadArquivo(mockFile);
      expect(res).toBeDefined();
      expect(res.nome_original).toBe('banner.jpg');
      expect(mockStorageService.salvarArquivo).toHaveBeenCalledWith(mockFile);
    });
  });
});
