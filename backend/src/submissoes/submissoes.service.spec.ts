/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
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
import { SubmissoesController } from './submissoes.controller';
import { SubmissoesService } from './submissoes.service';

process.env.JWT_SECRET = 'test_secret_for_submissoes_spec';

interface MockPrismaService {
  trabalhoAcademico: { findUnique: jest.Mock };
  perfilParecerista: { findUnique: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

describe('Submissoes (Controller & Service)', () => {
  let service: SubmissoesService;
  let jwtService: JwtService;
  let prisma: MockPrismaService;
  let app: INestApplication;

  beforeAll(async () => {
    prisma = {
      trabalhoAcademico: { findUnique: jest.fn() },
      perfilParecerista: { findUnique: jest.fn() },
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          { id_avaliacao: 1, id_correcao: 1, id_parecerista: 1 },
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
      controllers: [SubmissoesController],
      providers: [
        SubmissoesService,
        JwtStrategy,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SubmissoesService>(SubmissoesService);
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
        const tx = { $queryRaw: prisma.$queryRaw };
        return callback(tx as unknown as Prisma.TransactionClient);
      },
    );
  });

  describe('SubmissoesController - Autenticação e Autorização', () => {
    it('avaliar trabalho sem JWT retorna 401', async () => {
      await request(app.getHttpServer())
        .post('/submissoes/avaliacoes')
        .send({
          id_parecerista: 1,
          id_trabalho: 1,
          status: 'Aceito',
          parecer: 'Excelente',
          nota: 10,
        })
        .expect(401);
    });

    it('avaliar trabalho por participante retorna 403', async () => {
      const tokenParticipante = jwtService.sign({
        sub: 10,
        email: 'participante@teste.com',
        nome: 'Participante Teste',
        perfis: ['participante'],
      });

      await request(app.getHttpServer())
        .post('/submissoes/avaliacoes')
        .set('Authorization', `Bearer ${tokenParticipante}`)
        .send({
          id_parecerista: 1,
          id_trabalho: 1,
          status: 'Aceito',
          parecer: 'Excelente',
          nota: 10,
        })
        .expect(403);
    });

    it('avaliar trabalho por parecerista retorna 201', async () => {
      const tokenParecerista = jwtService.sign({
        sub: 5,
        email: 'parecerista@teste.com',
        nome: 'Parecerista Teste',
        perfis: ['parecerista'],
      });

      prisma.trabalhoAcademico.findUnique.mockResolvedValue({
        id_trabalho: 1,
        submissoes: [],
      });
      prisma.perfilParecerista.findUnique.mockResolvedValue({
        id_parecerista: 1,
        id_usuario: 5,
      });

      await request(app.getHttpServer())
        .post('/submissoes/avaliacoes')
        .set('Authorization', `Bearer ${tokenParecerista}`)
        .send({
          id_parecerista: 1,
          id_trabalho: 1,
          status: 'Aceito',
          parecer: 'Excelente',
          nota: 10,
        })
        .expect(201);

      expect(prisma.perfilParecerista.findUnique).toHaveBeenCalledWith({
        where: { id_usuario: 5 },
      });
    });

    it('avaliar trabalho por organizador sem perfil de parecerista retorna 403', async () => {
      const tokenOrganizador = jwtService.sign({
        sub: 7,
        email: 'organizador@teste.com',
        nome: 'Organizador Teste',
        perfis: ['organizador'],
      });

      await request(app.getHttpServer())
        .post('/submissoes/avaliacoes')
        .set('Authorization', `Bearer ${tokenOrganizador}`)
        .send({
          id_trabalho: 1,
          status: 'Aceito',
          parecer: 'Excelente',
          nota: 10,
        })
        .expect(403);
    });
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
      await expect(service.registrarAvaliacao(dto, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se o usuario autenticado nao for parecerista', async () => {
      prisma.trabalhoAcademico.findUnique.mockResolvedValue({ id_trabalho: 1 });
      prisma.perfilParecerista.findUnique.mockResolvedValue(null);

      await expect(service.registrarAvaliacao(dto, 99)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar ForbiddenException ao avaliar em nome de outro parecerista', async () => {
      prisma.trabalhoAcademico.findUnique.mockResolvedValue({
        id_trabalho: 1,
        submissoes: [],
      });
      prisma.perfilParecerista.findUnique.mockResolvedValue({
        id_parecerista: 2,
        id_usuario: 99,
      });

      await expect(
        service.registrarAvaliacao({ ...dto, id_parecerista: 1 }, 99),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('autor avaliando o próprio artigo lança ForbiddenException (conflito de interesses / blind review)', async () => {
      // Trabalho onde o autor possui id_usuario: 50 (ou id_autor: 1)
      prisma.trabalhoAcademico.findUnique.mockResolvedValue({
        id_trabalho: 1,
        submissoes: [
          {
            id_submissao: 1,
            id_autor: 1,
            autor: {
              id_autor: 1,
              id_usuario: 50,
            },
          },
        ],
      });

      // Parecerista possui o mesmo id_usuario: 50 (conflito de interesses)
      prisma.perfilParecerista.findUnique.mockResolvedValue({
        id_parecerista: 1,
        id_usuario: 50,
      });

      await expect(service.registrarAvaliacao(dto, 50)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('deve chamar sp_registrar_avaliacao_trabalho na transacao quando parecerista nao for autor', async () => {
      prisma.trabalhoAcademico.findUnique.mockResolvedValue({
        id_trabalho: 1,
        submissoes: [
          {
            id_submissao: 1,
            id_autor: 2,
            autor: {
              id_autor: 2,
              id_usuario: 88,
            },
          },
        ],
      });
      prisma.perfilParecerista.findUnique.mockResolvedValue({
        id_parecerista: 1,
        id_usuario: 99,
      });

      const result = await service.registrarAvaliacao(dto, 99);
      expect(result).toEqual(expect.objectContaining({ id_avaliacao: 1 }));
      expect(prisma.perfilParecerista.findUnique).toHaveBeenCalledWith({
        where: { id_usuario: 99 },
      });
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('usa o parecerista do token quando id_parecerista nao e enviado', async () => {
      prisma.trabalhoAcademico.findUnique.mockResolvedValue({
        id_trabalho: 1,
        submissoes: [],
      });
      prisma.perfilParecerista.findUnique.mockResolvedValue({
        id_parecerista: 3,
        id_usuario: 99,
      });

      const semParecerista = {
        id_trabalho: dto.id_trabalho,
        status: dto.status,
        parecer: dto.parecer,
        nota: dto.nota,
      };
      await service.registrarAvaliacao(semParecerista, 99);

      expect(prisma.$queryRaw).toHaveBeenCalledWith(
        expect.anything(),
        3,
        dto.id_trabalho,
        dto.status,
        dto.parecer,
        expect.anything(),
      );
    });
  });
});
