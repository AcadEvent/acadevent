import { BadRequestException, NotFoundException } from '@nestjs/common';
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

    it('deve criar evento e edicao com sucesso via transacao', async () => {
      mockPrismaService.perfilOrganizador.findUnique.mockResolvedValue({
        id_organizador: 10,
      });
      mockPrismaService.evento.create.mockResolvedValue({
        id_evento: 1,
        nome_marca: 'Semana Tech',
      });
      mockPrismaService.edicao.create.mockResolvedValue({
        id_edicao: 1,
        titulo_oficial: 'Semana Tech 2026',
        sigla: 'tech2026',
      });

      const resultado = await service.criarEvento(1, {
        nome_marca: 'Semana Tech',
        titulo_oficial: 'Semana Tech 2026',
        sigla: 'tech2026',
        unidade_promotora: 'FACOM',
        data_abertura_evento: new Date('2026-10-10'),
        data_encerramento_evento: new Date('2026-10-12'),
      });

      expect(resultado).toBeDefined();
      expect(resultado.edicao.sigla).toBe('tech2026');
    });
  });
});
