/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { InscricoesService } from './inscricoes.service';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  loteIngresso: {
    findUnique: jest.Mock;
  };
  perfilParticipante: {
    findUnique: jest.Mock;
  };
  cupom: {
    findUnique: jest.Mock;
  };
  inscricaoEdicao: {
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  pagamento: {
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  $queryRaw: jest.Mock;
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
      perfilParticipante: {
        findUnique: jest.fn(),
      },
      cupom: {
        findUnique: jest.fn(),
      },
      inscricaoEdicao: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      pagamento: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue([{ id_inscricao_edicao: 1 }]),
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(
      (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => {
        const tx = {
          $queryRaw: prisma.$queryRaw,
          inscricaoEdicao: {
            update: jest.fn().mockImplementation((args: any) =>
              Promise.resolve({
                id_inscricao_edicao: args?.where?.id_inscricao_edicao || 1,
                status: args?.data?.status || 'Confirmada',
                url_qrcode: args?.data?.url_qrcode || 'mock_hash',
              }),
            ),
          },
          pagamento: {
            create: jest.fn().mockImplementation((args: any) =>
              Promise.resolve({
                id_pagamento: 1,
                id_inscricao_edicao: args?.data?.id_inscricao_edicao || 1,
                valor: args?.data?.valor,
                status: args?.data?.status || 'Pendente',
              }),
            ),
            update: jest.fn().mockResolvedValue({ id_pagamento: 1 }),
          },
        };
        return callback(tx as unknown as Prisma.TransactionClient);
      },
    );

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

    it('deve lançar BadRequestException se o lote estiver esgotado na rotina SQL', async () => {
      prisma.loteIngresso.findUnique.mockResolvedValue({
        id_lote: 1,
        data_abertura_lote: new Date(Date.now() - 10000),
        data_encerramento_lote: new Date(Date.now() + 10000),
        numero_max_ingressos: 10,
        preco: new Prisma.Decimal(100),
      });
      prisma.perfilParticipante.findUnique.mockResolvedValue({
        id_participante: 1,
      });
      prisma.$queryRaw.mockRejectedValue(
        new Error('Erro: Este lote de ingressos ja esta esgotado.'),
      );

      await expect(service.criarInscricao(1, { id_lote: 1 })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('deve criar inscricao com sucesso sem cupom via sp_realizar_inscricao_edicao', async () => {
      prisma.loteIngresso.findUnique.mockResolvedValue({
        id_lote: 1,
        data_abertura_lote: new Date(Date.now() - 10000),
        data_encerramento_lote: new Date(Date.now() + 10000),
        numero_max_ingressos: 10,
        preco: new Prisma.Decimal(100),
      });
      prisma.perfilParticipante.findUnique.mockResolvedValue({
        id_participante: 1,
      });

      const result = await service.criarInscricao(1, { id_lote: 1 });
      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se cupom for de outra edicao', async () => {
      prisma.loteIngresso.findUnique.mockResolvedValue({
        id_lote: 1,
        id_edicao: 1,
        data_abertura_lote: new Date(Date.now() - 10000),
        data_encerramento_lote: new Date(Date.now() + 10000),
        numero_max_ingressos: 10,
        preco: new Prisma.Decimal(100),
      });
      prisma.perfilParticipante.findUnique.mockResolvedValue({
        id_participante: 1,
      });
      prisma.cupom.findUnique.mockResolvedValue({
        id_cupom: 2,
        id_edicao: 999,
        codigo: 'CUPOM_OUTRA_EDICAO',
        percentual_desconto: 20,
      });

      await expect(
        service.criarInscricao(1, {
          id_lote: 1,
          codigo_cupom: 'CUPOM_OUTRA_EDICAO',
        }),
      ).rejects.toThrow(
        new BadRequestException('Cupom invalido para esta edicao.'),
      );
    });

    it('deve confirmar automaticamente a inscricao com cupom de 100% de desconto e marcar pagamento como Aprovado', async () => {
      prisma.loteIngresso.findUnique.mockResolvedValue({
        id_lote: 1,
        id_edicao: 1,
        data_abertura_lote: new Date(Date.now() - 10000),
        data_encerramento_lote: new Date(Date.now() + 10000),
        numero_max_ingressos: 10,
        preco: new Prisma.Decimal(100),
      });
      prisma.perfilParticipante.findUnique.mockResolvedValue({
        id_participante: 1,
      });
      prisma.cupom.findUnique.mockResolvedValue({
        id_cupom: 1,
        id_edicao: 1,
        codigo: 'GRATIS100',
        percentual_desconto: 100,
      });

      const result = await service.criarInscricao(1, {
        id_lote: 1,
        codigo_cupom: 'GRATIS100',
      });

      expect(result.inscricao.status).toBe('Confirmada');
      expect(result.inscricao.url_qrcode).toBeDefined();
      expect(result.pagamento.status).toBe('Aprovado');
    });
  });

  describe('validarQrCode', () => {
    it('deve validar e credenciar na primeira vez, e lançar BadRequestException por replay attack na segunda vez', async () => {
      const mockInscricao = {
        id_inscricao_edicao: 1,
        status: 'Confirmada',
        url_qrcode: 'qr_replay_test',
        participante: {
          id_participante: 1,
          usuario: {
            id_usuario: 1,
            nome: 'Participante Teste',
            email: 'teste@example.com',
          },
        },
        lote: { id_lote: 1, id_edicao: 1 },
      };

      prisma.inscricaoEdicao.findFirst.mockResolvedValue(mockInscricao);

      const primeiraValidacao = await service.validarQrCode('qr_replay_test');
      expect(primeiraValidacao.valido).toBe(true);

      await expect(service.validarQrCode('qr_replay_test')).rejects.toThrow(
        new BadRequestException('QR Code ja utilizado para credenciamento.'),
      );
    });

    it('não deve retornar o campo senha_hash ao validar QR Code', async () => {
      const mockInscricaoComSenha = {
        id_inscricao_edicao: 2,
        status: 'Confirmada',
        url_qrcode: 'qr_sem_senha',
        participante: {
          id_participante: 2,
          usuario: {
            id_usuario: 2,
            nome: 'Usuario Seguro',
            email: 'seguro@example.com',
            senha_hash: '$2b$10$insecure_hash_should_not_leak',
          },
        },
        lote: { id_lote: 1, id_edicao: 1 },
      };

      prisma.inscricaoEdicao.findFirst.mockResolvedValue(mockInscricaoComSenha);

      const resultado = await service.validarQrCode('qr_sem_senha');
      expect(resultado.valido).toBe(true);
      expect(
        (resultado.inscricao.participante.usuario as any).senha_hash,
      ).toBeUndefined();
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
