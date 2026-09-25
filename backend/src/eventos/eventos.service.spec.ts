/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventosService } from './eventos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventosService', () => {
  let service: EventosService;

  const mockPrismaService = {
    edicao: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    evento: {
      create: jest.fn(),
    },
    perfilOrganizador: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    perfilUsuario: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EventosService>(EventosService);
  });

  describe('listarPublicos', () => {
    it('deve retornar lista de eventos publicados', async () => {
      mockPrismaService.edicao.findMany.mockResolvedValue([
        { id_edicao: 1, titulo_oficial: 'Semana Dev', sigla: 'sdev' },
      ]);

      const resultado = await service.listarPublicos();
      expect(resultado).toHaveLength(1);
      expect(mockPrismaService.edicao.findMany).toHaveBeenCalled();
    });
  });

  describe('buscarPorSlug', () => {
    it('deve retornar detalhes da edicao quando encontrada pela sigla', async () => {
      mockPrismaService.edicao.findFirst.mockResolvedValue({
        id_edicao: 1,
        sigla: 'secint2026',
        titulo_oficial: 'Semana de TI',
      });

      const resultado = await service.buscarPorSlug('secint2026');
      expect(resultado).toBeDefined();
      expect(resultado.sigla).toBe('secint2026');
    });

    it('deve lancar NotFoundException se o evento nao for encontrado', async () => {
      mockPrismaService.edicao.findFirst.mockResolvedValue(null);
      mockPrismaService.edicao.findUnique.mockResolvedValue(null);

      await expect(service.buscarPorSlug('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('nao deve incluir cupons na consulta nem retornar cupons na resposta publica', async () => {
      mockPrismaService.edicao.findFirst.mockImplementation((args) => {
        expect(args?.include?.cupons).toBeUndefined();
        return Promise.resolve({
          id_edicao: 1,
          sigla: 'secint2026',
          titulo_oficial: 'Semana de TI',
          evento: {},
          lotes: [],
          espacos: [],
          atividades: [],
        });
      });

      const resultado = await service.buscarPorSlug('secint2026');
      expect(resultado).toBeDefined();
      expect(resultado).not.toHaveProperty('cupons');
    });
  });

  describe('criarEvento', () => {
    it('deve lancar BadRequestException se data de encerramento for anterior a de abertura', async () => {
      await expect(
        service.criarEvento(1, {
          nome_marca: 'Evento Invalido',
          titulo_oficial: 'Edicao Invalida',
          sigla: 'inv2026',
          unidade_promotora: 'Faculdade',
          data_abertura_evento: new Date('2026-10-15'),
          data_encerramento_evento: new Date('2026-10-10'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar evento gerando slug conforme Contrato v1 (sigla original preservada e slug kebab-case)', async () => {
      mockPrismaService.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 10,
      });
      mockPrismaService.evento.create.mockResolvedValue({
        id_evento: 1,
        nome_marca: 'Simposio de TI',
      });
      mockPrismaService.edicao.findFirst.mockResolvedValue(null);
      mockPrismaService.edicao.create.mockImplementation((args) => ({
        id_edicao: 1,
        ...args.data,
      }));

      const resultado = await service.criarEvento(1, {
        nome_marca: 'Simposio de TI',
        titulo_oficial: 'Simposio de TI 2026',
        sigla: 'SITC',
        numero_edicao: '2026',
        unidade_promotora: 'FACOM',
        data_abertura_evento: new Date('2026-10-10'),
        data_encerramento_evento: new Date('2026-10-12'),
      });

      expect(resultado).toBeDefined();
      expect(resultado.edicao.sigla).toBe('SITC');
      expect(resultado.edicao.slug).toBe('sitc-2026');
      expect(resultado.edicao.numero_edicao).toBe('2026');
    });

    it('deve adicionar sufixo -2 se o slug gerado ja existir no banco', async () => {
      mockPrismaService.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 10,
      });
      mockPrismaService.evento.create.mockResolvedValue({
        id_evento: 2,
        nome_marca: 'Simposio de TI',
      });
      mockPrismaService.edicao.findFirst
        .mockResolvedValueOnce({ id_edicao: 1, slug: 'sitc-2026' })
        .mockResolvedValueOnce(null);
      mockPrismaService.edicao.create.mockImplementation((args) => ({
        id_edicao: 2,
        ...args.data,
      }));

      const resultado = await service.criarEvento(1, {
        nome_marca: 'Simposio de TI',
        titulo_oficial: 'Simposio de TI 2026',
        sigla: 'SITC',
        numero_edicao: '2026',
        unidade_promotora: 'FACOM',
        data_abertura_evento: new Date('2026-10-10'),
        data_encerramento_evento: new Date('2026-10-12'),
      });

      expect(resultado).toBeDefined();
      expect(resultado.edicao.slug).toBe('sitc-2026-2');
    });

    it('deve aceitar slug quando sigla nao for explicitamente informada', async () => {
      mockPrismaService.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 10,
      });
      mockPrismaService.evento.create.mockResolvedValue({
        id_evento: 3,
        nome_marca: 'Semana Tech 2',
      });
      mockPrismaService.edicao.create.mockImplementation((args) => ({
        id_edicao: 3,
        titulo_oficial: 'Semana Tech 2027',
        sigla: args.data.sigla,
        slug: args.data.slug,
      }));

      const resultado = await service.criarEvento(1, {
        nome_marca: 'Semana Tech 2',
        titulo_oficial: 'Semana Tech 2027',
        slug: 'tech2027',
        unidade_promotora: 'FACOM',
        data_abertura_evento: new Date('2027-10-10'),
        data_encerramento_evento: new Date('2027-10-12'),
      });

      expect(resultado).toBeDefined();
      expect(resultado.edicao.sigla).toBe('tech2027');
      expect(resultado.edicao.slug).toBe('tech2027');
    });
  });

  describe('atualizarStatus', () => {
    const edicaoExistente = {
      id_edicao: 1,
      status_evento: 'Publicado',
      evento: {
        id_evento: 10,
        id_organizador: 5,
        organizador: {
          id_organizador: 5,
          id_usuario: 1,
        },
      },
    };

    it('deve lancar ForbiddenException se usuario nao for organizador do evento nem admin (IDOR)', async () => {
      mockPrismaService.edicao.findUnique.mockResolvedValue(edicaoExistente);
      mockPrismaService.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 99,
        id_usuario: 2,
      });

      const usuarioNaoAutorizado = {
        id_usuario: 2,
        perfis: ['participante'],
      };

      await expect(
        service.atualizarStatus(
          1,
          { status: 'Encerrado' },
          usuarioNaoAutorizado,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir atualizarStatus se usuario for admin', async () => {
      mockPrismaService.edicao.findUnique.mockResolvedValue(edicaoExistente);
      mockPrismaService.edicao.update.mockResolvedValue({
        ...edicaoExistente,
        status_evento: 'Encerrado',
      });

      const usuarioAdmin = {
        id_usuario: 999,
        perfis: ['administrador'],
      };

      const resultado = await service.atualizarStatus(
        1,
        { status: 'Encerrado' },
        usuarioAdmin,
      );

      expect(resultado.status_evento).toBe('Encerrado');
    });

    it('deve permitir atualizarStatus se usuario for o organizador do evento', async () => {
      mockPrismaService.edicao.findUnique.mockResolvedValue(edicaoExistente);
      mockPrismaService.edicao.update.mockResolvedValue({
        ...edicaoExistente,
        status_evento: 'Em andamento',
      });

      const usuarioOrganizador = {
        id_usuario: 1,
        perfis: ['organizador'],
      };

      const resultado = await service.atualizarStatus(
        1,
        { status: 'Em andamento' },
        usuarioOrganizador,
      );

      expect(resultado.status_evento).toBe('Em andamento');
    });

    it('deve lancar BadRequestException em transicao invalida de Encerrado para Publicado', async () => {
      const edicaoEncerrada = {
        id_edicao: 1,
        status_evento: 'Encerrado',
        evento: {
          id_evento: 10,
          id_organizador: 5,
          organizador: {
            id_organizador: 5,
            id_usuario: 1,
          },
        },
      };
      mockPrismaService.edicao.findUnique.mockResolvedValue(edicaoEncerrada);

      const usuarioOrganizador = {
        id_usuario: 1,
        perfis: ['organizador'],
      };

      await expect(
        service.atualizarStatus(1, { status: 'Publicado' }, usuarioOrganizador),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lancar BadRequestException em transicao invalida de Encerrado para Rascunho', async () => {
      const edicaoEncerrada = {
        id_edicao: 1,
        status_evento: 'Encerrado',
        evento: {
          id_evento: 10,
          id_organizador: 5,
          organizador: {
            id_organizador: 5,
            id_usuario: 1,
          },
        },
      };
      mockPrismaService.edicao.findUnique.mockResolvedValue(edicaoEncerrada);

      const usuarioOrganizador = {
        id_usuario: 1,
        perfis: ['organizador'],
      };

      await expect(
        service.atualizarStatus(1, { status: 'Rascunho' }, usuarioOrganizador),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
