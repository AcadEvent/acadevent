/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AtividadesService } from './atividades.service';
import { AtividadesController } from './atividades.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

interface MockPrismaService {
  atividade: {
    findUnique: jest.Mock;
  };
  perfilParticipante: {
    findUnique: jest.Mock;
  };
  inscricaoEdicao: {
    findFirst: jest.Mock;
  };
  inscricaoAtividade: {
    count: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
  };
  presenca: {
    createMany: jest.Mock;
  };
}

describe('AtividadesService', () => {
  let service: AtividadesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      atividade: {
        findUnique: jest.fn(),
      },
      perfilParticipante: {
        findUnique: jest.fn(),
      },
      inscricaoEdicao: {
        findFirst: jest.fn(),
      },
      inscricaoAtividade: {
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      presenca: {
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtividadesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AtividadesService>(AtividadesService);
  });

  it('deve lançar NotFoundException se atividade não existir', async () => {
    prisma.atividade.findUnique.mockResolvedValue(null);

    await expect(service.inscrever(1, { id_atividade: 999 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar ForbiddenException se participante não for encontrado', async () => {
    prisma.atividade.findUnique.mockResolvedValue({
      id_atividade: 1,
      id_edicao: 1,
      reservas: [],
    });
    prisma.perfilParticipante.findUnique.mockResolvedValue(null);

    await expect(service.inscrever(1, { id_atividade: 1 })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve lançar ForbiddenException se inscrição no evento não estiver Confirmada', async () => {
    prisma.atividade.findUnique.mockResolvedValue({
      id_atividade: 1,
      id_edicao: 1,
      reservas: [],
    });
    prisma.perfilParticipante.findUnique.mockResolvedValue({
      id_participante: 10,
      id_usuario: 1,
    });
    prisma.inscricaoEdicao.findFirst.mockResolvedValue({
      id_inscricao_edicao: 100,
      status: 'Pendente',
    });

    await expect(service.inscrever(1, { id_atividade: 1 })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve lançar BadRequestException se lotação do espaço físico for atingida', async () => {
    prisma.atividade.findUnique.mockResolvedValue({
      id_atividade: 1,
      id_edicao: 1,
      reservas: [{ espaco: { capacidade_max: 20 } }],
    });
    prisma.perfilParticipante.findUnique.mockResolvedValue({
      id_participante: 10,
      id_usuario: 1,
    });
    prisma.inscricaoEdicao.findFirst.mockResolvedValue({
      id_inscricao_edicao: 100,
      status: 'Confirmada',
    });
    prisma.inscricaoAtividade.count.mockResolvedValue(20);

    await expect(service.inscrever(1, { id_atividade: 1 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve efetuar inscrição com sucesso se todas as regras forem atendidas', async () => {
    prisma.atividade.findUnique.mockResolvedValue({
      id_atividade: 1,
      id_edicao: 1,
      reservas: [{ espaco: { capacidade_max: 20 } }],
    });
    prisma.perfilParticipante.findUnique.mockResolvedValue({
      id_participante: 10,
      id_usuario: 1,
    });
    prisma.inscricaoEdicao.findFirst.mockResolvedValue({
      id_inscricao_edicao: 100,
      status: 'Confirmada',
    });
    prisma.inscricaoAtividade.count.mockResolvedValue(5);
    prisma.inscricaoAtividade.create.mockResolvedValue({
      id_inscricao_atividade: 1,
      id_inscricao_edicao: 100,
      id_atividade: 1,
      status: 'Inscrito',
    });

    const resultado = await service.inscrever(1, { id_atividade: 1 });
    expect(resultado).toEqual({
      id_inscricao_atividade: 1,
      id_inscricao_edicao: 100,
      id_atividade: 1,
      status: 'Inscrito',
    });
  });

  it('deve lançar BadRequestException se chamada for enviada com array vazio', async () => {
    await expect(service.registrarChamada([])).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve registrar chamada em lote com sucesso', async () => {
    prisma.inscricaoAtividade.findUnique.mockResolvedValue({
      id_inscricao_atividade: 10,
      id_atividade: 1,
    });
    prisma.presenca.createMany.mockResolvedValue({ count: 1 });

    const resultado = await service.registrarChamada([
      { id_inscricao_atividade: 10, status: 'Presente' },
    ]);
    expect(resultado).toEqual({ count: 1 });
    expect(prisma.presenca.createMany).toHaveBeenCalledTimes(1);
  });

  it('deve aceitar RegistrarPresencaDto estruturado sem lançar TypeError', async () => {
    prisma.inscricaoAtividade.findUnique.mockResolvedValue({
      id_inscricao_atividade: 10,
      id_atividade: 1,
    });
    prisma.presenca.createMany.mockResolvedValue({ count: 1 });

    const dtoEstruturado = {
      presencas: [{ id_inscricao_atividade: 10, status: 'Presente' }],
    };

    const resultado = await service.registrarChamada(dtoEstruturado);
    expect(resultado).toEqual({ count: 1 });
    expect(prisma.presenca.createMany).toHaveBeenCalledTimes(1);
  });

  it('não deve considerar inscrições canceladas ao verificar capacidade da atividade', async () => {
    prisma.atividade.findUnique.mockResolvedValue({
      id_atividade: 1,
      id_edicao: 1,
      reservas: [{ espaco: { capacidade_max: 20 } }],
    });
    prisma.perfilParticipante.findUnique.mockResolvedValue({
      id_participante: 10,
      id_usuario: 1,
    });
    prisma.inscricaoEdicao.findFirst.mockResolvedValue({
      id_inscricao_edicao: 100,
      status: 'Confirmada',
    });
    prisma.inscricaoAtividade.count.mockResolvedValue(19);
    prisma.inscricaoAtividade.create.mockResolvedValue({
      id_inscricao_atividade: 1,
      id_inscricao_edicao: 100,
      id_atividade: 1,
      status: 'Inscrito',
    });

    await service.inscrever(1, { id_atividade: 1 });

    expect(prisma.inscricaoAtividade.count).toHaveBeenCalledWith({
      where: {
        id_atividade: 1,
        status: { not: 'Cancelada' },
      },
    });
  });

  it('não deve gerar conflito de horário com inscrições com status Cancelada', async () => {
    const dataInicio = new Date('2026-10-01T10:00:00Z');
    const dataFim = new Date('2026-10-01T12:00:00Z');

    prisma.atividade.findUnique.mockResolvedValue({
      id_atividade: 2,
      id_edicao: 1,
      reservas: [
        {
          espaco: { capacidade_max: 20 },
          data_inicio: dataInicio,
          data_final: dataFim,
        },
      ],
    });
    prisma.perfilParticipante.findUnique.mockResolvedValue({
      id_participante: 10,
      id_usuario: 1,
    });
    prisma.inscricaoEdicao.findFirst.mockResolvedValue({
      id_inscricao_edicao: 100,
      status: 'Confirmada',
    });
    prisma.inscricaoAtividade.findMany.mockImplementation((args: any) => {
      if (args?.where?.status?.not === 'Cancelada') {
        return [];
      }
      return [
        {
          status: 'Cancelada',
          atividade: {
            titulo: 'Atividade Cancelada',
            reservas: [{ data_inicio: dataInicio, data_final: dataFim }],
          },
        },
      ];
    });
    prisma.inscricaoAtividade.count.mockResolvedValue(0);
    prisma.inscricaoAtividade.create.mockResolvedValue({
      id_inscricao_atividade: 2,
      id_inscricao_edicao: 100,
      id_atividade: 2,
      status: 'Inscrito',
    });

    const resultado = await service.inscrever(1, { id_atividade: 2 });
    expect(resultado).toBeDefined();
    expect(prisma.inscricaoAtividade.create).toHaveBeenCalled();
  });

  describe('AtividadesController - chamada sem JWT', () => {
    it('deve possuir JwtAuthGuard aplicado ao endpoint chamada', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        AtividadesController.prototype.chamada,
      );
      expect(guards).toBeDefined();
      const temJwtGuard = guards.some(
        (guard: any) =>
          guard === JwtAuthGuard ||
          guard?.name === 'JwtAuthGuard' ||
          (typeof guard === 'function' && guard.name === 'JwtAuthGuard'),
      );
      expect(temJwtGuard).toBe(true);
    });
  });
});
