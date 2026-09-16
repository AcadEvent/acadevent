import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { EspacosService } from './espacos.service';
import { EspacosController } from './espacos.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

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
      providers: [EspacosService, { provide: PrismaService, useValue: prisma }],
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

    it('deve lançar BadRequestException se o espaco e a atividade pertencerem a edicoes diferentes', async () => {
      prisma.espacoFisico.findUnique.mockResolvedValue({
        id_espaco: 1,
        id_edicao: 1,
      });
      prisma.atividade.findUnique.mockResolvedValue({
        id_atividade: 1,
        id_edicao: 2,
      });

      await expect(service.reservarEspaco(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se horario de inicio da reserva for anterior ao inicio da atividade', async () => {
      prisma.espacoFisico.findUnique.mockResolvedValue({
        id_espaco: 1,
        id_edicao: 1,
      });
      prisma.atividade.findUnique.mockResolvedValue({
        id_atividade: 1,
        id_edicao: 1,
        data_abertura_atividade: new Date('2026-10-10T15:00:00'),
        data_encerramento_atividade: new Date('2026-10-10T17:00:00'),
      });

      await expect(service.reservarEspaco(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se horario final da reserva for posterior ao termino da atividade', async () => {
      prisma.espacoFisico.findUnique.mockResolvedValue({
        id_espaco: 1,
        id_edicao: 1,
      });
      prisma.atividade.findUnique.mockResolvedValue({
        id_atividade: 1,
        id_edicao: 1,
        data_abertura_atividade: new Date('2026-10-10T14:00:00'),
        data_encerramento_atividade: new Date('2026-10-10T17:00:00'),
      });

      await expect(service.reservarEspaco(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se horario da reserva estiver fora do intervalo do evento (edicao)', async () => {
      prisma.espacoFisico.findUnique.mockResolvedValue({
        id_espaco: 1,
        id_edicao: 1,
      });
      prisma.atividade.findUnique.mockResolvedValue({
        id_atividade: 1,
        id_edicao: 1,
        data_abertura_atividade: new Date('2026-10-10T14:00:00'),
        data_encerramento_atividade: new Date('2026-10-10T18:00:00'),
        edicao: {
          id_edicao: 1,
          data_abertura_evento: new Date('2026-10-11T00:00:00'),
          data_encerramento_evento: new Date('2026-10-12T00:00:00'),
        },
      });

      await expect(service.reservarEspaco(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve chamar sp_reservar_espaco na transacao', async () => {
      prisma.espacoFisico.findUnique.mockResolvedValue({
        id_espaco: 1,
        id_edicao: 1,
      });
      prisma.atividade.findUnique.mockResolvedValue({
        id_atividade: 1,
        id_edicao: 1,
        data_abertura_atividade: new Date('2026-10-10T14:00:00'),
        data_encerramento_atividade: new Date('2026-10-10T18:00:00'),
        edicao: {
          id_edicao: 1,
          data_abertura_evento: new Date('2026-10-01T00:00:00'),
          data_encerramento_evento: new Date('2026-10-20T00:00:00'),
        },
      });

      const result = await service.reservarEspaco(dto);
      expect(result).toEqual(expect.objectContaining({ id_reserva: 1 }));
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});

describe('EspacosController - Autenticação e Autorização', () => {
  it('deve ter JwtAuthGuard e RolesGuard aplicados na classe EspacosController', () => {
    const guards = Reflect.getMetadata('__guards__', EspacosController) as
      | unknown[]
      | undefined;
    expect(guards).toBeDefined();
    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(RolesGuard);
  });
});
