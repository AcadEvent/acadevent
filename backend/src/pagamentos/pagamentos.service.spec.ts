/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { InscricoesService } from '../inscricoes/inscricoes.service';
import { PrismaService } from '../prisma/prisma.service';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';

process.env.JWT_SECRET = 'test_secret_for_pagamentos_spec';
process.env.WEBHOOK_SECRET = 'acadevent_webhook_secret';

describe('Pagamentos (Controller & Service)', () => {
  let app: INestApplication;
  let service: PagamentosService;
  let jwtService: JwtService;

  const mockPrismaService = {
    inscricaoEdicao: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    pagamento: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    edicao: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
      cb(mockPrismaService),
    ),
  };

  const mockInscricoesService = {
    processarWebhook: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [PagamentosController],
      providers: [
        PagamentosService,
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: InscricoesService, useValue: mockInscricoesService },
      ],
    }).compile();

    service = module.get<PagamentosService>(PagamentosService);
    jwtService = module.get<JwtService>(JwtService);

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PagamentosController - Segurança e Autenticação', () => {
    it('confirmarManual sem JWT retorna 401', async () => {
      await request(app.getHttpServer())
        .post('/pagamentos/confirmar-manual')
        .send({ id_inscricao_edicao: 1 })
        .expect(401);
    });

    it('confirmarManual por usuário sem permissão retorna 403', async () => {
      const tokenParticipante = jwtService.sign({
        sub: 10,
        email: 'participante@teste.com',
        nome: 'Participante Teste',
        perfis: ['participante'],
      });

      await request(app.getHttpServer())
        .post('/pagamentos/confirmar-manual')
        .set('Authorization', `Bearer ${tokenParticipante}`)
        .send({ id_inscricao_edicao: 1 })
        .expect(403);
    });

    it('webhook sem segredo/assinatura retorna 401', async () => {
      await request(app.getHttpServer())
        .post('/pagamentos/webhook')
        .send({ gateway_id: 'gw-100', status: 'Aprovado' })
        .expect(401);
    });

    it('confirmarManual por organizador retorna 201', async () => {
      const tokenOrganizador = jwtService.sign({
        sub: 2,
        email: 'organizador@teste.com',
        nome: 'Organizador Teste',
        perfis: ['organizador'],
      });

      mockPrismaService.inscricaoEdicao.findUnique.mockResolvedValue({
        id_inscricao_edicao: 1,
        status: 'Pendente',
        pagamentos: [],
      });
      mockPrismaService.inscricaoEdicao.update.mockResolvedValue({
        id_inscricao_edicao: 1,
        status: 'Confirmada',
        url_qrcode: 'mock-qr',
      });
      mockPrismaService.pagamento.create.mockResolvedValue({
        id_pagamento: 1,
        status: 'Aprovado',
      });

      await request(app.getHttpServer())
        .post('/pagamentos/confirmar-manual')
        .set('Authorization', `Bearer ${tokenOrganizador}`)
        .send({ id_inscricao_edicao: 1 })
        .expect(201);
    });

    it('webhook com segredo valido retorna 201', async () => {
      mockPrismaService.pagamento.findFirst.mockResolvedValue({
        id_pagamento: 1,
        gateway_id: 'gw-100',
        status: 'Pendente',
        id_inscricao_edicao: 1,
      });
      mockPrismaService.pagamento.update.mockResolvedValue({
        id_pagamento: 1,
        status: 'Aprovado',
      });
      mockPrismaService.inscricaoEdicao.update.mockResolvedValue({
        id_inscricao_edicao: 1,
        status: 'Confirmada',
        url_qrcode: 'mock-qr',
      });

      await request(app.getHttpServer())
        .post('/pagamentos/webhook')
        .set('x-webhook-secret', 'acadevent_webhook_secret')
        .send({ gateway_id: 'gw-100', status: 'Aprovado' })
        .expect(201);
    });
  });

  describe('PagamentosService - processarWebhook e Idempotência', () => {
    it('webhook reemitido para pagamento já Aprovado não recria o hash do QR Code (idempotência)', async () => {
      const pagamentoJaAprovado = {
        id_pagamento: 1,
        gateway_id: 'gw-already-approved',
        status: 'Aprovado',
        id_inscricao_edicao: 1,
        inscricao: {
          id_inscricao_edicao: 1,
          status: 'Confirmada',
          url_qrcode: 'existing-hash-qr-123',
        },
      };

      mockPrismaService.pagamento.findFirst.mockResolvedValue(
        pagamentoJaAprovado,
      );

      const resultado = await (service as any).processarWebhook({
        gateway_id: 'gw-already-approved',
        status: 'Aprovado',
      });

      expect(resultado).toBeDefined();
      expect(resultado.inscricao.url_qrcode).toBe('existing-hash-qr-123');
      expect(mockPrismaService.inscricaoEdicao.update).not.toHaveBeenCalled();
    });

    it('processarWebhook aprova pagamento Pendente e gera QR code inicial', async () => {
      const pagamentoPendente = {
        id_pagamento: 2,
        gateway_id: 'gw-pending',
        status: 'Pendente',
        id_inscricao_edicao: 2,
      };

      mockPrismaService.pagamento.findFirst.mockResolvedValue(
        pagamentoPendente,
      );
      mockPrismaService.pagamento.update.mockResolvedValue({
        ...pagamentoPendente,
        status: 'Aprovado',
      });
      mockPrismaService.inscricaoEdicao.update.mockResolvedValue({
        id_inscricao_edicao: 2,
        status: 'Confirmada',
        url_qrcode: 'newly-generated-hash',
      });

      const resultado = await (service as any).processarWebhook({
        gateway_id: 'gw-pending',
        status: 'Aprovado',
      });

      expect(resultado.pagamento.status).toBe('Aprovado');
      expect(mockPrismaService.inscricaoEdicao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_inscricao_edicao: 2 },
          data: expect.objectContaining({
            status: 'Confirmada',
            url_qrcode: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('PagamentosService - confirmarManual', () => {
    it('deve lançar NotFoundException se inscricao nao for encontrada', async () => {
      mockPrismaService.inscricaoEdicao.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmarManual({ id_inscricao_edicao: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se inscricao ja estiver Confirmada', async () => {
      mockPrismaService.inscricaoEdicao.findUnique.mockResolvedValue({
        id_inscricao_edicao: 1,
        status: 'Confirmada',
        pagamentos: [],
      });

      await expect(
        service.confirmarManual({ id_inscricao_edicao: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('PagamentosService - gerarRelatorioFinanceiro', () => {
    it('deve calcular totais financeiros da edicao corretamente', async () => {
      mockPrismaService.edicao.findUnique.mockResolvedValue({
        id_edicao: 1,
        titulo_oficial: 'Semana de TI',
      });

      mockPrismaService.inscricaoEdicao.findMany.mockResolvedValue([
        {
          id_inscricao_edicao: 1,
          status: 'Confirmada',
          pagamentos: [{ status: 'Aprovado', valor: new Prisma.Decimal(100) }],
        },
        {
          id_inscricao_edicao: 2,
          status: 'Pendente',
          pagamentos: [{ status: 'Pendente', valor: new Prisma.Decimal(50) }],
        },
      ]);

      const relatorio = await service.gerarRelatorioFinanceiro(1);

      expect(relatorio.id_edicao).toBe(1);
      expect(relatorio.resumo_inscricoes.confirmadas).toBe(1);
      expect(relatorio.resumo_inscricoes.pendentes).toBe(1);
      expect(
        relatorio.resumo_financeiro.receita_total_confirmada.toString(),
      ).toBe('100');
    });
  });
});
