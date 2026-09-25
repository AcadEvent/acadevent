import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { EspacosController } from './espacos.controller';
import { EspacosService } from './espacos.service';

process.env.JWT_SECRET = 'test_secret_for_espacos_controller_spec';

describe('EspacosController - Autorizacao por papel', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const mockEspacosService = {
    criarEspaco: jest.fn().mockResolvedValue({ id_espaco: 1 }),
    listarEspacosPorEdicao: jest.fn().mockResolvedValue([]),
    reservarEspaco: jest.fn().mockResolvedValue({ id_reserva: 1 }),
    obterMapaOcupacao: jest.fn().mockResolvedValue([]),
  };

  const token = (perfis: string[]) =>
    jwtService.sign({ sub: 1, email: 'u@teste.com', nome: 'Usuario', perfis });

  const novoEspaco = { id_edicao: 1, nome_sala: 'Sala 1', capacidade_max: 30 };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [EspacosController],
      providers: [
        JwtStrategy,
        { provide: EspacosService, useValue: mockEspacosService },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('participante nao pode criar espaco (403)', async () => {
    await request(app.getHttpServer())
      .post('/espacos')
      .set('Authorization', `Bearer ${token(['participante'])}`)
      .send(novoEspaco)
      .expect(403);
    expect(mockEspacosService.criarEspaco).not.toHaveBeenCalled();
  });

  it('participante nao pode reservar espaco (403)', async () => {
    await request(app.getHttpServer())
      .post('/espacos/reservar')
      .set('Authorization', `Bearer ${token(['participante'])}`)
      .send({
        id_espaco: 1,
        id_atividade: 1,
        data_inicio: '2026-10-20T10:00:00Z',
        data_final: '2026-10-20T12:00:00Z',
      })
      .expect(403);
    expect(mockEspacosService.reservarEspaco).not.toHaveBeenCalled();
  });

  it('organizador pode criar espaco (201)', async () => {
    await request(app.getHttpServer())
      .post('/espacos')
      .set('Authorization', `Bearer ${token(['organizador'])}`)
      .send(novoEspaco)
      .expect(201);
    expect(mockEspacosService.criarEspaco).toHaveBeenCalled();
  });
});
