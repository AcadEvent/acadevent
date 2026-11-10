import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InscreverAtividadeDto } from './dto/inscrever-atividade.dto';
import {
  RegistrarPresencaDto,
  RegistrarPresencaItemDto,
} from './dto/registrar-presenca.dto';
import { CriarAtividadeDto } from './dto/criar-atividade.dto';
import { AssociarMinistranteDto } from './dto/associar-ministrante.dto';

/**
 * Periodo em que a atividade acontece: o horario da reserva de espaco quando
 * existe, senao as datas da propria atividade. `null` quando nao ha horario
 * definido (nesse caso nao ha como detectar conflito).
 */
function periodoDaAtividade(atividade: {
  data_abertura_atividade: Date | null;
  data_encerramento_atividade: Date | null;
  reservas: { data_inicio: Date | null; data_final: Date | null }[];
}): { inicio: Date; fim: Date } | null {
  const reserva = atividade.reservas.find((r) => r.data_inicio && r.data_final);
  const inicio = reserva?.data_inicio ?? atividade.data_abertura_atividade;
  const fim = reserva?.data_final ?? atividade.data_encerramento_atividade;
  return inicio && fim ? { inicio, fim } : null;
}

@Injectable()
export class AtividadesService {
  constructor(private readonly prisma: PrismaService) {}

  async criarAtividade(dto: CriarAtividadeDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: dto.id_edicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    return this.prisma.atividade.create({
      data: {
        id_edicao: dto.id_edicao,
        titulo: dto.titulo,
        tipo_atividade: dto.tipo_atividade,
        descricao: dto.descricao,
        carga_horario: dto.carga_horario,
        data_abertura_atividade: dto.data_abertura_atividade,
        data_encerramento_atividade: dto.data_encerramento_atividade,
      },
    });
  }

  async obterCronogramaPorEdicao(idEdicao: number) {
    return this.prisma.atividade.findMany({
      where: { id_edicao: idEdicao },
      include: {
        reservas: {
          include: {
            espaco: true,
          },
        },
        atividadesMinistrantes: {
          include: {
            ministrante: {
              include: {
                usuario: {
                  select: {
                    nome: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { data_abertura_atividade: 'asc' },
    });
  }

  async associarMinistrante(dto: AssociarMinistranteDto) {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id_atividade: dto.id_atividade },
    });

    if (!atividade) {
      throw new NotFoundException('Atividade nao encontrada.');
    }

    const ministrante = await this.prisma.perfilMinistrante.findUnique({
      where: { id_ministrante: dto.id_ministrante },
    });

    if (!ministrante) {
      throw new NotFoundException('Perfil de ministrante nao encontrado.');
    }

    return this.prisma.atividadeMinistrante.create({
      data: {
        id_atividade: dto.id_atividade,
        id_ministrante: dto.id_ministrante,
      },
    });
  }

  async inscrever(usuarioId: number, dto: InscreverAtividadeDto) {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id_atividade: dto.id_atividade },
      include: {
        reservas: {
          include: {
            espaco: true,
          },
        },
      },
    });

    if (!atividade) {
      throw new NotFoundException('Atividade nao encontrada.');
    }

    const perfilParticipante = await this.prisma.perfilParticipante.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (!perfilParticipante) {
      throw new ForbiddenException(
        'Perfil de participante nao encontrado para este usuario.',
      );
    }

    // Usa a inscricao CONFIRMADA no evento: o participante pode ter outras
    // pendentes (reenvios do checkout) e a primeira nao deve barrar a atividade.
    const inscricaoEdicao = await this.prisma.inscricaoEdicao.findFirst({
      where: {
        id_participante: perfilParticipante.id_participante,
        status: 'Confirmada',
        lote: {
          id_edicao: atividade.id_edicao,
        },
      },
      orderBy: { id_inscricao_edicao: 'asc' },
    });

    if (!inscricaoEdicao) {
      throw new ForbiddenException(
        'Precondicao financeira nao atendida: inscricao no evento nao confirmada.',
      );
    }

    const doParticipanteNoEvento = {
      id_participante: perfilParticipante.id_participante,
      lote: { id_edicao: atividade.id_edicao },
    };

    const inscricaoAtividadeExistente =
      await this.prisma.inscricaoAtividade.findFirst({
        where: {
          id_atividade: dto.id_atividade,
          status: { not: 'Cancelada' },
          inscricaoEdicao: doParticipanteNoEvento,
        },
      });

    if (inscricaoAtividadeExistente) {
      throw new BadRequestException(
        'Participante ja inscrito nesta atividade.',
      );
    }

    // Conflito de horario na grade do participante (RF05.4): vale com ou sem
    // sala reservada, usando o periodo real de cada atividade.
    const reservaAtual = atividade.reservas[0];
    const periodoAtual = periodoDaAtividade(atividade);
    if (periodoAtual) {
      const outrasInscricoes = await this.prisma.inscricaoAtividade.findMany({
        where: {
          status: { not: 'Cancelada' },
          inscricaoEdicao: doParticipanteNoEvento,
        },
        include: {
          atividade: {
            include: {
              reservas: true,
            },
          },
        },
      });

      for (const item of outrasInscricoes) {
        const periodo = periodoDaAtividade(item.atividade);
        if (
          periodo &&
          periodoAtual.inicio < periodo.fim &&
          periodoAtual.fim > periodo.inicio
        ) {
          throw new ConflictException(
            `Conflito de horario na grade do participante com a atividade "${item.atividade.titulo}".`,
          );
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const inscritosAtuais = await tx.inscricaoAtividade.count({
        where: {
          id_atividade: dto.id_atividade,
          status: { not: 'Cancelada' },
        },
      });

      if (reservaAtual && reservaAtual.espaco) {
        const capacidadeMax = reservaAtual.espaco.capacidade_max;
        if (inscritosAtuais >= capacidadeMax) {
          throw new BadRequestException(
            'Lotacao maxima do espaco fisico atingida.',
          );
        }
      }

      return tx.inscricaoAtividade.create({
        data: {
          id_inscricao_edicao: inscricaoEdicao.id_inscricao_edicao,
          id_atividade: dto.id_atividade,
          status: 'Inscrito',
        },
      });
    });
  }

  async registrarChamada(
    dados: RegistrarPresencaItemDto[] | RegistrarPresencaDto,
    usuarioId?: number,
  ) {
    const itens = Array.isArray(dados) ? dados : dados?.presencas;

    if (!itens || itens.length === 0) {
      throw new BadRequestException(
        'A lista de chamadas nao pode estar vazia.',
      );
    }

    if (usuarioId) {
      const eOrganizador = await this.prisma.perfilOrganizador.findUnique({
        where: { id_usuario: usuarioId },
      });
      const eMinistrante = await this.prisma.perfilMinistrante.findUnique({
        where: { id_usuario: usuarioId },
      });
      const eAdmin = await this.prisma.perfilAdministrador.findUnique({
        where: { id_usuario: usuarioId },
      });

      if (!eOrganizador && !eMinistrante && !eAdmin) {
        throw new ForbiddenException(
          'Acesso negado: apenas organizadores ou ministrantes podem registrar chamadas.',
        );
      }
    }

    const presencasData: Prisma.PresencaCreateManyInput[] = [];

    for (const item of itens) {
      if (item.status !== 'Presente' && item.status !== 'Ausente') {
        throw new BadRequestException(
          `Status invalido "${item.status}". Aceitos estritamente: "Presente" ou "Ausente".`,
        );
      }

      const inscricaoAtividade =
        await this.prisma.inscricaoAtividade.findUnique({
          where: { id_inscricao_atividade: item.id_inscricao_atividade },
        });

      if (!inscricaoAtividade) {
        throw new NotFoundException(
          `Inscricao em atividade ID ${item.id_inscricao_atividade} nao encontrada.`,
        );
      }

      presencasData.push({
        id_inscricao_atividade: item.id_inscricao_atividade,
        id_atividade: inscricaoAtividade.id_atividade,
        status: item.status,
        data: new Date(),
      });
    }

    return this.prisma.presenca.createMany({
      data: presencasData,
    });
  }
}
