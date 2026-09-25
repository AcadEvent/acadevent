/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { INestApplication, NotFoundException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { ComunicacaoController } from './comunicacao.controller';
import { ComunicacaoService } from './comunicacao.service';

process.env.JWT_SECRET = 'test_secret_for_comunicacao_spec';

describe('Comunicacao (Controller & Service)', () => {
  let service: ComunicacaoService;
  let jwtService: JwtService;
  let app: INestApplication;

  const mockPrismaService = {
    edicao: {
      findUnique: jest.fn(),
    },
    comunicado: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    inscricaoEdicao: {
      findMany: jest.fn(),
    },
    notificacao: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
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
      controllers: [ComunicacaoController],
      providers: [
        ComunicacaoService,
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ComunicacaoService>(ComunicacaoService);
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

  describe('ComunicacaoController - Autorização', () => {
    it('enviar comunicado por participante retorna 403', async () => {
      const tokenParticipante = jwtService.sign({
        sub: 10,
        email: 'participante@teste.com',
        nome: 'Participante Teste',
        perfis: ['participante'],
      });

      await request(app.getHttpServer())
        .post('/comunicacao/enviar')
        .set('Authorization', `Bearer ${tokenParticipante}`)
        .send({
          id_edicao: 1,
          titulo: 'Comunicado Nao Permitido',
          conteudo: 'Tentativa de envio por participante',
        })
        .expect(403);
    });
  });

  describe('enviarComunicado', () => {
    it('deve lancar NotFoundException se a edicao nao existir', async () => {
      mockPrismaService.edicao.findUnique.mockResolvedValue(null);

      await expect(
        service.enviarComunicado({
          id_edicao: 999,
          titulo: 'Aviso',
          conteudo: 'Mensagem teste',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve registrar comunicado com sucesso e disparar notificacoes', async () => {
      mockPrismaService.edicao.findUnique.mockResolvedValue({ id_edicao: 1 });
      mockPrismaService.comunicado.create.mockResolvedValue({
        id_comunicado: 10,
        id_edicao: 1,
        titulo: 'Aviso Importante',
        conteudo: 'Conteudo',
        perfil_alvo: 'todos',
      });
      mockPrismaService.inscricaoEdicao.findMany.mockResolvedValue([
        {
          participante: {
            usuario: { id_usuario: 5, email: 'aluno@teste.com' },
          },
        },
      ]);
      mockPrismaService.notificacao.createMany.mockResolvedValue({ count: 1 });

      const resultado = await service.enviarComunicado({
        id_edicao: 1,
        titulo: 'Aviso Importante',
        conteudo: 'Conteudo',
      });

      expect(resultado).toBeDefined();
      expect(mockPrismaService.comunicado.create).toHaveBeenCalled();
    });

    it('envio com id_atividade ou perfil_alvo filtra apenas os destinatários pretendidos', async () => {
      mockPrismaService.edicao.findUnique.mockResolvedValue({ id_edicao: 1 });
      mockPrismaService.comunicado.create.mockResolvedValue({
        id_comunicado: 20,
        id_edicao: 1,
        id_atividade: 5,
        perfil_alvo: 'ministrante',
        titulo: 'Aviso Palestra',
        conteudo: 'Sala alterada para sala 101',
      });

      mockPrismaService.inscricaoEdicao.findMany.mockResolvedValue([
        {
          participante: {
            usuario: { id_usuario: 8, email: 'ministrante@teste.com' },
          },
        },
      ]);
      mockPrismaService.notificacao.createMany.mockResolvedValue({ count: 1 });

      await service.enviarComunicado({
        id_edicao: 1,
        id_atividade: 5,
        perfil_alvo: 'ministrante',
        titulo: 'Aviso Palestra',
        conteudo: 'Sala alterada para sala 101',
      });

      expect(mockPrismaService.inscricaoEdicao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            inscricoesAtividades: {
              some: { id_atividade: 5 },
            },
            participante: expect.objectContaining({
              usuario: expect.objectContaining({
                perfis: expect.objectContaining({
                  some: expect.objectContaining({
                    tipo_perfil: expect.objectContaining({
                      equals: 'ministrante',
                      mode: 'insensitive',
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      );

      expect(mockPrismaService.notificacao.createMany).toHaveBeenCalledWith({
        data: [
          {
            id_usuario: 8,
            titulo: 'Aviso Palestra',
            mensagem: 'Sala alterada para sala 101',
          },
        ],
      });
    });
  });

  describe('listarPorEdicao', () => {
    it('deve retornar lista de comunicados ordenados por data', async () => {
      mockPrismaService.comunicado.findMany.mockResolvedValue([
        { id_comunicado: 1, titulo: 'Aviso 1' },
      ]);

      const lista = await service.listarPorEdicao(1);
      expect(lista).toHaveLength(1);
      expect(mockPrismaService.comunicado.findMany).toHaveBeenCalled();
    });
  });
});
