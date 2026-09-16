import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import PDFDocument from 'pdfkit';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { EmitirCertificadoAtividadeDto } from './dto/emitir-certificado-atividade.dto';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  edicao: { findUnique: jest.Mock };
  usuario: { findUnique: jest.Mock };
  certificado: { findUnique: jest.Mock; findFirst: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

describe('CertificadosService', () => {
  let service: CertificadosService;
  let controller: CertificadosController;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      edicao: { findUnique: jest.fn() },
      usuario: { findUnique: jest.fn() },
      certificado: {
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          { id_certificado: 1, codigo_autenticidade: 'AUTH-A7B8-C9D0' },
        ]),
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(
      (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => {
        const tx = { $queryRaw: prisma.$queryRaw };
        return callback(tx as unknown as Prisma.TransactionClient);
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificadosController],
      providers: [
        CertificadosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CertificadosService>(CertificadosService);
    controller = module.get<CertificadosController>(CertificadosController);
  });

  describe('emitirCertificadoAtividade', () => {
    const dto: EmitirCertificadoAtividadeDto = {
      id_edicao: 1,
      id_atividade: 10,
      id_usuario: 6,
    };

    it('deve lancar NotFoundException se a edicao nao existir', async () => {
      prisma.edicao.findUnique.mockResolvedValue(null);
      await expect(service.emitirCertificadoAtividade(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lancar NotFoundException se o usuario nao existir', async () => {
      prisma.edicao.findUnique.mockResolvedValue({ id_edicao: 1 });
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(service.emitirCertificadoAtividade(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve chamar sp_emitir_certificado_atividade na transacao', async () => {
      prisma.edicao.findUnique.mockResolvedValue({ id_edicao: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id_usuario: 6 });

      const result = await service.emitirCertificadoAtividade(dto);
      expect(result).toEqual(
        expect.objectContaining({ codigo_autenticidade: 'AUTH-A7B8-C9D0' }),
      );
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('deve gerar automaticamente codigo de autenticidade no servidor com formato AUTH-UUID', async () => {
      prisma.edicao.findUnique.mockResolvedValue({ id_edicao: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id_usuario: 6 });

      await service.emitirCertificadoAtividade(dto);

      expect(prisma.$queryRaw).toHaveBeenCalled();
      const allCalls = prisma.$queryRaw.mock.calls as unknown[][];
      const rawCall = allCalls[0] ?? [];
      const passedCode = rawCall.find(
        (val: unknown): val is string =>
          typeof val === 'string' && val.startsWith('AUTH-'),
      );
      expect(passedCode).toMatch(
        /^AUTH-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('deve lancar ConflictException ao tentar emitir segundo certificado para mesmo usuario e atividade', async () => {
      prisma.edicao.findUnique.mockResolvedValue({ id_edicao: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id_usuario: 6 });
      prisma.certificado.findFirst.mockResolvedValue({
        id_certificado: 1,
        id_usuario: 6,
        id_atividade: 10,
      });

      await expect(service.emitirCertificadoAtividade(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validarCertificado', () => {
    it('deve lancar NotFoundException se certificado nao for encontrado', async () => {
      prisma.certificado.findUnique.mockResolvedValue(null);
      await expect(service.validarCertificado('INVALIDO')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve retornar informacoes do certificado valido', async () => {
      prisma.certificado.findUnique.mockResolvedValue({
        id_certificado: 1,
        codigo_autenticidade: 'AUTH-VALIDO',
        usuario: { nome: 'Aluno Teste', email: 'aluno@teste.com' },
        edicao: { titulo_oficial: 'Congresso 2026' },
      });

      const res = await service.validarCertificado('AUTH-VALIDO');
      expect(res.valido).toBe(true);
      expect(res.certificado.codigo_autenticidade).toBe('AUTH-VALIDO');
    });

    it('nao deve expor o e-mail completo do participante na validacao publica (LGPD)', async () => {
      prisma.certificado.findUnique.mockResolvedValue({
        id_certificado: 1,
        codigo_autenticidade: 'AUTH-VALIDO',
        usuario: { nome: 'Aluno Teste', email: 'aluno@teste.com' },
        edicao: { titulo_oficial: 'Congresso 2026' },
      });

      const res = await service.validarCertificado('AUTH-VALIDO');
      expect(res.valido).toBe(true);
      expect(res.certificado.usuario.email).not.toBe('aluno@teste.com');
      expect(res.certificado.usuario.email).toMatch(/^a\*{3}o@teste\.com$/);
    });
  });

  describe('gerarPdfCertificado', () => {
    it('deve gerar buffer de PDF para certificado valido', async () => {
      prisma.certificado.findUnique.mockResolvedValue({
        id_certificado: 1,
        codigo_autenticidade: 'AUTH-VALIDO',
        nome_atividade: 'Palestra de Abertura',
        carga_horaria_impressa: '4',
        usuario: { nome: 'Aluno Teste', email: 'aluno@teste.com' },
        edicao: { titulo_oficial: 'Congresso 2026' },
      });

      const buffer = await service.gerarPdfCertificado('AUTH-VALIDO');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('deve registrar a carga horaria real da atividade no PDF gerado', async () => {
      const textSpy = jest.spyOn(PDFDocument.prototype, 'text');
      prisma.certificado.findUnique.mockResolvedValue({
        id_certificado: 1,
        codigo_autenticidade: 'AUTH-VALIDO-20H',
        nome_atividade: 'Curso Avancado de Node.js',
        carga_horaria_impressa: null,
        atividade: {
          id_atividade: 10,
          titulo: 'Curso Avancado de Node.js',
          carga_horario: 20,
        },
        usuario: { nome: 'Aluno Teste', email: 'aluno@teste.com' },
        edicao: { titulo_oficial: 'Congresso 2026' },
      });

      await service.gerarPdfCertificado('AUTH-VALIDO-20H');

      const textCalls = textSpy.mock.calls.map((call) => call[0]);
      const bodyText = textCalls.find(
        (t) =>
          typeof t === 'string' &&
          t.includes('cumprindo carga horaria total de'),
      );

      expect(bodyText).toContain('cumprindo carga horaria total de 20 horas.');
      expect(bodyText).not.toContain(
        'cumprindo carga horaria total de 4 horas.',
      );
      textSpy.mockRestore();
    });

    it('deve usar FRONTEND_URL ou http://localhost:3000 na URL de validacao impressa no PDF', async () => {
      const textSpy = jest.spyOn(PDFDocument.prototype, 'text');
      prisma.certificado.findUnique.mockResolvedValue({
        id_certificado: 1,
        codigo_autenticidade: 'AUTH-VALIDO',
        nome_atividade: 'Palestra',
        carga_horaria_impressa: '4',
        usuario: { nome: 'Aluno Teste', email: 'aluno@teste.com' },
        edicao: { titulo_oficial: 'Congresso 2026' },
      });

      const originalEnv = process.env.FRONTEND_URL;
      try {
        delete process.env.FRONTEND_URL;
        await service.gerarPdfCertificado('AUTH-VALIDO');

        const textCalls = textSpy.mock.calls.map((call) => call[0]);
        const validationUrlText = textCalls.find(
          (t) =>
            typeof t === 'string' && t.includes('Valide este certificado em:'),
        );
        expect(validationUrlText).toContain(
          'http://localhost:3000/validar/AUTH-VALIDO',
        );
        expect(validationUrlText).not.toContain('http://localhost:3001');
      } finally {
        process.env.FRONTEND_URL = originalEnv;
        textSpy.mockRestore();
      }
    });
  });

  describe('CertificadosController - downloadCertificado', () => {
    it('deve sanitizar codigo com aspas ou caracteres ilegais no header Content-Disposition', async () => {
      const setSpy = jest.fn();
      const endSpy = jest.fn();
      const mockRes = {
        set: setSpy,
        end: endSpy,
      } as unknown as Response;

      jest
        .spyOn(service, 'gerarPdfCertificado')
        .mockResolvedValue(Buffer.from('fake-pdf'));

      const unsafeCodigo = 'AUTH-123"; filename="hack.exe';
      await controller.downloadCertificado(unsafeCodigo, mockRes);

      expect(setSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition':
            'attachment; filename="certificado-AUTH-123filenamehackexe.pdf"',
        }),
      );
    });
  });
});
