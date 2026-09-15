import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ComunicacaoService } from './comunicacao.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ComunicacaoService', () => {
  let service: ComunicacaoService;

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
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunicacaoService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ComunicacaoService>(ComunicacaoService);
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
      mockPrismaService.notificacao.create.mockResolvedValue({});

      const resultado = await service.enviarComunicado({
        id_edicao: 1,
        titulo: 'Aviso Importante',
        conteudo: 'Conteudo',
      });

      expect(resultado).toBeDefined();
      expect(mockPrismaService.comunicado.create).toHaveBeenCalled();
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
