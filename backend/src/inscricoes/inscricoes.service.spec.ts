import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { InscricoesService } from './inscricoes.service';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  loteIngresso: {
    findUnique: jest.Mock;
  };
  inscricaoEdicao: {
    count: jest.Mock;
  };
  perfilParticipante: {
    findUnique: jest.Mock;
  };
  cupom: {
    findUnique: jest.Mock;
  };
  pagamento: {
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  $transaction: jest.Mock;
}

describe('InscricoesService', () => {
  let service: InscricoesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      loteIngresso: {
        findUnique: jest.fn(),
      },
      inscricaoEdicao: {
        count: jest.fn(),
      },
      perfilParticipante: {
        findUnique: jest.fn(),
      },
      cupom: {
        findUnique: jest.fn(),
      },
      pagamento: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(
        (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => {
          const tx = {
            cupom: { update: jest.fn() },
            inscricaoEdicao: {
              create: jest.fn().mockResolvedValue({ id_inscricao_edicao: 1 }),
              update: jest.fn().mockResolvedValue({ id_inscricao_edicao: 1 }),
            },
            pagamento: {
              create: jest.fn().mockResolvedValue({ id_pagamento: 1 }),
              update: jest.fn().mockResolvedValue({ id_pagamento: 1 }),
            },
          };
          return callback(tx as unknown as Prisma.TransactionClient);
        },
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscricoesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<InscricoesService>(InscricoesService);
  });

  describe('criarInscricao', () => {
    it('deve lançar NotFoundException se lote não for encontrado', async () => {
      prisma.loteIngresso.findUnique.mockResolvedValue(null);
      await expect(service.criarInscricao(1, { id_lote: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se lote estiver fechado (antes da abertura)', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 1);
      prisma.loteIngresso.findUnique.mockResolvedValue({
        id_lote: 1,
        data_abertura_lote: dataFutura,
        numero_max_ingressos: 10,
        preco: new Prisma.Decimal(100),
      });

      await expect(service.criarInscricao(1, { id_lote: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se lote estiver cheio', async () => {
      prisma.loteIngresso.findUnique.mockResolvedValue({
        id_lote: 1,
        data_abertura_lote: new Date(Date.now() - 10000),
        data_encerramento_lote: new Date(Date.now() + 10000),
        numero_max_ingressos: 10,
        preco: new Prisma.Decimal(100),
      });
      prisma.inscricaoEdicao.count.mockResolvedValue(10);

      await expect(service.criarInscricao(1, { id_lote: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve criar inscricao com sucesso sem cupom', async () => {
      prisma.loteIngresso.findUnique.mockResolvedValue({
        id_lote: 1,
        data_abertura_lote: new Date(Date.now() - 10000),
        data_encerramento_lote: new Date(Date.now() + 10000),
        numero_max_ingressos: 10,
        preco: new Prisma.Decimal(100),
      });
      prisma.inscricaoEdicao.count.mockResolvedValue(5);
      prisma.perfilParticipante.findUnique.mockResolvedValue({
        id_participante: 1,
      });

      const result = await service.criarInscricao(1, { id_lote: 1 });
      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('processarWebhook', () => {
    it('deve lançar NotFoundException se pagamento não for encontrado', async () => {
      prisma.pagamento.findFirst.mockResolvedValue(null);
      await expect(
        service.processarWebhook({ gateway_id: '123', status: 'Aprovado' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve processar status Aprovado e atualizar tabelas via transaction', async () => {
      prisma.pagamento.findFirst.mockResolvedValue({
        id_pagamento: 1,
        id_inscricao_edicao: 1,
      });
      const result = await service.processarWebhook({
        gateway_id: '123',
        status: 'Aprovado',
      });
      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('deve apenas atualizar pagamento se status diferente de Aprovado', async () => {
      prisma.pagamento.findFirst.mockResolvedValue({
        id_pagamento: 1,
        id_inscricao_edicao: 1,
      });
      prisma.pagamento.update.mockResolvedValue({
        id_pagamento: 1,
        status: 'Recusado',
      });
      await service.processarWebhook({ gateway_id: '123', status: 'Recusado' });
      expect(prisma.pagamento.update).toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
