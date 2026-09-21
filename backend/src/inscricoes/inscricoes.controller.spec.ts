import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { InscricoesController } from './inscricoes.controller';
import { InscricoesService } from './inscricoes.service';

process.env.JWT_SECRET = 'test_secret_for_inscricoes_controller_spec';

describe('InscricoesController - validar-qrcode (check-in)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const mockInscricoesService = {
    validarQrCode: jest.fn().mockResolvedValue({ valido: true }),
  };

  const token = (perfis: string[]) =>
    jwtService.sign({ sub: 1, email: 'u@teste.com', nome: 'Usuario', perfis });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [InscricoesController],
      providers: [
        JwtStrategy,
        { provide: InscricoesService, useValue: mockInscricoesService },
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

  it('sem autenticacao retorna 401 e nao consome o QR Code', async () => {
    await request(app.getHttpServer())
      .post('/inscricoes/validar-qrcode')
      .send({ url_qrcode: 'qr-teste' })
      .expect(401);
    expect(mockInscricoesService.validarQrCode).not.toHaveBeenCalled();
  });

  it('participante retorna 403 e nao consome o QR Code', async () => {
    await request(app.getHttpServer())
      .post('/inscricoes/validar-qrcode')
      .set('Authorization', `Bearer ${token(['participante'])}`)
      .send({ url_qrcode: 'qr-teste' })
      .expect(403);
    expect(mockInscricoesService.validarQrCode).not.toHaveBeenCalled();
  });

  it('organizador valida o QR Code (201)', async () => {
    await request(app.getHttpServer())
      .post('/inscricoes/validar-qrcode')
      .set('Authorization', `Bearer ${token(['organizador'])}`)
      .send({ url_qrcode: 'qr-teste' })
      .expect(201);
    expect(mockInscricoesService.validarQrCode).toHaveBeenCalledWith(
      'qr-teste',
    );
  });
});
