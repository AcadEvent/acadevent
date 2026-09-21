/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';

process.env.JWT_SECRET = 'test_secret_for_inventario_spec';

interface MockPrismaService {
  edicao: { findUnique: jest.Mock };
  itemInventarioFisico: {
    findUnique: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  registroInventario: {
    findUnique: jest.Mock;
    updateMany: jest.Mock;
    update: jest.Mock;
  };
  perfilOrganizador: { findUnique: jest.Mock };
  perfilMinistrante: { findUnique: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

describe('Inventario (Controller & Service)', () => {
  let service: InventarioService;
  let jwtService: JwtService;
  let prisma: MockPrismaService;
  let app: INestApplication;

  beforeAll(async () => {
    prisma = {
      edicao: { findUnique: jest.fn() },
      itemInventarioFisico: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      registroInventario: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      perfilOrganizador: { findUnique: jest.fn() },
      perfilMinistrante: { findUnique: jest.fn() },
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          { id_registro_item: 1, id_item: 1, quantidade_retirada: 2 },
        ]),
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [InventarioController],
      providers: [
        InventarioService,
        JwtStrategy,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InventarioService>(InventarioService);
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

    prisma.$transaction.mockImplementation(
      (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => {
        const tx = {
          $queryRaw: prisma.$queryRaw,
          itemInventarioFisico: prisma.itemInventarioFisico,
          registroInventario: prisma.registroInventario,
        };
        return callback(tx as unknown as Prisma.TransactionClient);
      },
    );
  });

  describe('InventarioController - Autenticação e Autorização', () => {
    it('retirarItem sem JWT retorna 401', async () => {
      await request(app.getHttpServer())
        .post('/inventario/retirar')
        .send({
          id_item: 1,
          id_organizador: 1,
          quantidade_retirada: 1,
        })
        .expect(401);
    });

    it('retirarItem por participante retorna 403', async () => {
      const tokenParticipante = jwtService.sign({
        sub: 10,
        email: 'participante@teste.com',
        nome: 'Participante Teste',
        perfis: ['participante'],
      });

      await request(app.getHttpServer())
        .post('/inventario/retirar')
        .set('Authorization', `Bearer ${tokenParticipante}`)
        .send({
          id_item: 1,
          id_organizador: 1,
          quantidade_retirada: 1,
        })
        .expect(403);
    });

    it('retirarItem por organizador autenticado retorna 201', async () => {
      const tokenOrganizador = jwtService.sign({
        sub: 2,
        email: 'organizador@teste.com',
        nome: 'Organizador Teste',
        perfis: ['organizador'],
      });

      prisma.itemInventarioFisico.findUnique.mockResolvedValue({
        id_item: 1,
        quantidade_disponivel: 5,
      });
      prisma.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 1,
      });

      await request(app.getHttpServer())
        .post('/inventario/retirar')
        .set('Authorization', `Bearer ${tokenOrganizador}`)
        .send({
          id_item: 1,
          id_organizador: 1,
          quantidade_retirada: 1,
        })
        .expect(201);

      expect(prisma.perfilOrganizador.findUnique).toHaveBeenCalledWith({
        where: { id_usuario: 2 },
      });
    });
  });

  describe('retirarItem', () => {
    it('deve lançar NotFoundException se o item nao existir', async () => {
      prisma.itemInventarioFisico.findUnique.mockResolvedValue(null);
      await expect(
        service.retirarItem(
          {
            id_item: 99,
            id_organizador: 1,
            quantidade_retirada: 1,
          },
          2,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o usuario autenticado nao for organizador', async () => {
      prisma.itemInventarioFisico.findUnique.mockResolvedValue({
        id_item: 1,
        quantidade_disponivel: 5,
      });
      prisma.perfilOrganizador.findUnique.mockResolvedValue(null);

      await expect(
        service.retirarItem({ id_item: 1, quantidade_retirada: 1 }, 2),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException ao registrar retirada em nome de outro organizador', async () => {
      prisma.itemInventarioFisico.findUnique.mockResolvedValue({
        id_item: 1,
        quantidade_disponivel: 5,
      });
      prisma.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 1,
        id_usuario: 2,
      });

      await expect(
        service.retirarItem(
          { id_item: 1, id_organizador: 9, quantidade_retirada: 1 },
          2,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('deve chamar sp_retirar_inventario na transacao', async () => {
      prisma.itemInventarioFisico.findUnique.mockResolvedValue({
        id_item: 1,
        quantidade_disponivel: 5,
      });
      prisma.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 1,
      });

      const result = await service.retirarItem(
        {
          id_item: 1,
          quantidade_retirada: 2,
        },
        2,
      );

      expect(result.registro).toEqual(
        expect.objectContaining({ id_registro_item: 1 }),
      );
      expect(prisma.perfilOrganizador.findUnique).toHaveBeenCalledWith({
        where: { id_usuario: 2 },
      });
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('devolverItem', () => {
    it('deve lançar NotFoundException se o registro nao existir', async () => {
      prisma.registroInventario.findUnique.mockResolvedValue(null);
      await expect(service.devolverItem(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devolverItem concorrente impede double-return (incremento duplicado do estoque)', async () => {
      const registroMock = {
        id_registro_item: 1,
        id_item: 10,
        quantidade_retirada: 5,
        status: 'Retirado',
      };

      // Ambos encontram o registro antes da transacao com status 'Retirado'
      prisma.registroInventario.findUnique.mockResolvedValue(registroMock);

      // Na transacao do primeiro: updateMany atômico com status 'Retirado' atualiza 1 linha
      prisma.registroInventario.updateMany
        .mockResolvedValueOnce({ count: 1 })
        // Na transacao concorrente: updateMany atômico com status 'Retirado' atualiza 0 linhas (ja devolvido)
        .mockResolvedValueOnce({ count: 0 });

      prisma.itemInventarioFisico.update.mockResolvedValue({
        id_item: 10,
        quantidade_disponivel: 15,
      });

      // Primeiro retorno bem-sucedido
      const res1 = await service.devolverItem(1);
      expect(res1).toBeDefined();
      expect(prisma.itemInventarioFisico.update).toHaveBeenCalledTimes(1);

      // Segundo retorno concorrente deve falhar impedindo double-return
      await expect(service.devolverItem(1)).rejects.toThrow(
        BadRequestException,
      );
      // Confirma que estoque NÃO foi incrementado uma segunda vez
      expect(prisma.itemInventarioFisico.update).toHaveBeenCalledTimes(1);
      expect(prisma.registroInventario.updateMany).toHaveBeenCalledWith({
        where: {
          id_registro_item: 1,
          status: 'Retirado',
        },
        data: expect.objectContaining({
          status: 'Devolvido',
        }),
      });
    });
  });
});
