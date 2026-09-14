import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { CertificadosService } from './certificados.service';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  edicao: { findUnique: jest.Mock };
  usuario: { findUnique: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

describe('CertificadosService', () => {
  let service: CertificadosService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      edicao: { findUnique: jest.fn() },
      usuario: { findUnique: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([
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
      providers: [
        CertificadosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CertificadosService>(CertificadosService);
  });

  describe('emitirCertificadoAtividade', () => {
    const dto = {
      id_edicao: 1,
      id_atividade: 10,
      id_usuario: 6,
      codigo_autenticidade: 'AUTH-A7B8-C9D0',
    };

    it('deve lançar NotFoundException se a edicao nao existir', async () => {
      prisma.edicao.findUnique.mockResolvedValue(null);
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
  });
});
