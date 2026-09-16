import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'acadevent_test_jwt_secret_e2e';

import { AppModule } from './../src/app.module';

describe('Security & Access Control (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Storage Security & Path Traversal', () => {
    it('deve rejeitar tentativa de Path Traversal com 403 Forbidden', () => {
      return request(app.getHttpServer())
        .get('/storage/arquivos/%2e%2e%2fgeral/arquivo.pdf')
        .expect(403);
    });

    it('deve rejeitar upload de arquivos sem autenticacao JWT com 401 Unauthorized', () => {
      return request(app.getHttpServer()).post('/storage/upload').expect(401);
    });
  });

  describe('Broken Access Control - Rotas Mutatorias Protegidas', () => {
    it('deve rejeitar confirmacao manual de pagamento anonima com 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/pagamentos/confirmar-manual')
        .send({ id_inscricao_edicao: 1 })
        .expect(401);
    });

    it('deve rejeitar webhook de pagamento sem segredo com 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/pagamentos/webhook')
        .send({ gateway_id: 'gw_1', status: 'Aprovado' })
        .expect(401);
    });

    it('deve rejeitar criacao de espaco fisico anonima com 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/espacos')
        .send({ id_edicao: 1, nome_sala: 'Auditório', capacidade_max: 100 })
        .expect(401);
    });

    it('deve rejeitar reserva de espaco anonima com 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/espacos/reservar')
        .send({
          id_espaco: 1,
          id_atividade: 1,
          data_inicio: '2026-10-20T10:00:00Z',
          data_final: '2026-10-20T12:00:00Z',
        })
        .expect(401);
    });

    it('deve rejeitar retirada de inventario anonima com 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/inventario/retirar')
        .send({ id_item: 1, quantidade_retirada: 1 })
        .expect(401);
    });

    it('deve rejeitar avaliacao de trabalhos anonima com 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/submissoes/avaliacoes')
        .send({ id_trabalho: 1, nota: 90, parecer: 'Bom' })
        .expect(401);
    });

    it('deve rejeitar emissao de certificado anonima com 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post('/certificados/atividade')
        .send({ id_edicao: 1, id_atividade: 1, id_usuario: 1 })
        .expect(401);
    });

    it('deve rejeitar consulta a logs administrativos sem autenticacao com 401 Unauthorized', () => {
      return request(app.getHttpServer()).get('/admin/logs').expect(401);
    });
  });
});
