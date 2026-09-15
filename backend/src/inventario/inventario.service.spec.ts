import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { InventarioService } from './inventario.service';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  edicao: { findUnique: jest.Mock };
  itemInventarioFisico: { findUnique: jest.Mock };
  perfilOrganizador: { findUnique: jest.Mock };
  perfilMinistrante: { findUnique: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

describe('InventarioService', () => {
  let service: InventarioService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      edicao: { findUnique: jest.fn() },
      itemInventarioFisico: { findUnique: jest.fn() },
      perfilOrganizador: { findUnique: jest.fn() },
      perfilMinistrante: { findUnique: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([
        { id_registro_item: 1, id_item: 1, quantidade_retirada: 2 },
      ]),
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(
      (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => {
        const tx = {
          $queryRaw: prisma.$queryRaw,
          itemInventarioFisico: {
            findUnique: jest.fn().mockResolvedValue({
              id_item: 1,
              quantidade_disponivel: 3,
            }),
          },
        };
        return callback(tx as unknown as Prisma.TransactionClient);
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventarioService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InventarioService>(InventarioService);
  });

  describe('retirarItem', () => {
    it('deve lançar NotFoundException se o item nao existir', async () => {
      prisma.itemInventarioFisico.findUnique.mockResolvedValue(null);
      await expect(
        service.retirarItem({
          id_item: 99,
          id_organizador: 1,
          quantidade_retirada: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve chamar sp_retirar_inventario na transacao', async () => {
      prisma.itemInventarioFisico.findUnique.mockResolvedValue({
        id_item: 1,
        quantidade_disponivel: 5,
      });
      prisma.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 1,
      });

      const result = await service.retirarItem({
        id_item: 1,
        id_organizador: 1,
        quantidade_retirada: 2,
      });

      expect(result.registro).toEqual(
        expect.objectContaining({ id_registro_item: 1 }),
      );
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
