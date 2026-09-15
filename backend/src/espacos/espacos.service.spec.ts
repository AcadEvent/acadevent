import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { EspacosService } from './espacos.service';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  edicao: { findUnique: jest.Mock };
  espacoFisico: { findUnique: jest.Mock };
  atividade: { findUnique: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

describe('EspacosService', () => {
  let service: EspacosService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      edicao: { findUnique: jest.fn() },
      espacoFisico: { findUnique: jest.fn() },
      atividade: { findUnique: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([{ id_reserva: 1 }]),
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
        EspacosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EspacosService>(EspacosService);
  });

  describe('reservarEspaco', () => {
    const dto = {
      id_atividade: 1,
      id_espaco: 1,
      data_inicio: new Date('2026-10-10T14:00:00'),
      data_final: new Date('2026-10-10T18:00:00'),
    };

    it('deve lançar BadRequestException se a data final nao for posterior', async () => {
      await expect(
        service.reservarEspaco({
          ...dto,
          data_final: dto.data_inicio,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException se o espaco nao existir', async () => {
      prisma.espacoFisico.findUnique.mockResolvedValue(null);
      await expect(service.reservarEspaco(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve chamar sp_reservar_espaco na transacao', async () => {
      prisma.espacoFisico.findUnique.mockResolvedValue({ id_espaco: 1 });
      prisma.atividade.findUnique.mockResolvedValue({ id_atividade: 1 });

      const result = await service.reservarEspaco(dto);
      expect(result).toEqual(expect.objectContaining({ id_reserva: 1 }));
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
