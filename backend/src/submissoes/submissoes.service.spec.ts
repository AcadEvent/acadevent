import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { SubmissoesService } from './submissoes.service';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  trabalhoAcademico: { findUnique: jest.Mock };
  perfilParecerista: { findUnique: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

describe('SubmissoesService', () => {
  let service: SubmissoesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      trabalhoAcademico: { findUnique: jest.fn() },
      perfilParecerista: { findUnique: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([
        { id_avaliacao: 1, id_correcao: 1, id_parecerista: 1 },
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
        SubmissoesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SubmissoesService>(SubmissoesService);
  });

  describe('registrarAvaliacao', () => {
    const dto = {
      id_parecerista: 1,
      id_trabalho: 1,
      status: 'Aceito',
      parecer: 'Excelente trabalho.',
      nota: 9.5,
    };

    it('deve lançar NotFoundException se o trabalho nao existir', async () => {
      prisma.trabalhoAcademico.findUnique.mockResolvedValue(null);
      await expect(service.registrarAvaliacao(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve chamar sp_registrar_avaliacao_trabalho na transacao', async () => {
      prisma.trabalhoAcademico.findUnique.mockResolvedValue({ id_trabalho: 1 });
      prisma.perfilParecerista.findUnique.mockResolvedValue({
        id_parecerista: 1,
      });

      const result = await service.registrarAvaliacao(dto);
      expect(result).toEqual(expect.objectContaining({ id_avaliacao: 1 }));
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
