import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AtividadesService } from './atividades.service';
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
    findFirst: jest.Mock;
    findUnique: jest.Mock;
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
        findFirst: jest.fn(),
        findUnique: jest.fn(),
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
});
