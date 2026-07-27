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
import { RegistrarPresencaItemDto } from './dto/registrar-presenca.dto';
import { CriarAtividadeDto } from './dto/criar-atividade.dto';
import { AssociarMinistranteDto } from './dto/associar-ministrante.dto';

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

    const inscricaoEdicao = await this.prisma.inscricaoEdicao.findFirst({
      where: {
        id_participante: perfilParticipante.id_participante,
        lote: {
          id_edicao: atividade.id_edicao,
        },
      },
    });

    if (!inscricaoEdicao || inscricaoEdicao.status !== 'Confirmada') {
      throw new ForbiddenException(
        'Precondicao financeira nao atendida: inscricao no evento nao confirmada.',
      );
    }

    const inscricaoAtividadeExistente = await this.prisma.inscricaoAtividade.findFirst({
      where: {
        id_inscricao_edicao: inscricaoEdicao.id_inscricao_edicao,
        id_atividade: dto.id_atividade,
      },
    });

    if (inscricaoAtividadeExistente) {
      throw new BadRequestException('Participante ja inscrito nesta atividade.');
    }

    const reservaAtual = atividade.reservas[0];
    if (reservaAtual && reservaAtual.data_inicio && reservaAtual.data_final) {
      const outrasInscricoes = await this.prisma.inscricaoAtividade.findMany({
        where: {
          id_inscricao_edicao: inscricaoEdicao.id_inscricao_edicao,
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
        for (const res of item.atividade.reservas) {
          if (res.data_inicio && res.data_final) {
            if (
              reservaAtual.data_inicio < res.data_final &&
              reservaAtual.data_final > res.data_inicio
            ) {
              throw new ConflictException(
                `Conflito de horario na grade do participante com a atividade "${item.atividade.titulo}".`,
              );
            }
          }
        }
      }
    }

    const inscritosAtuais = await this.prisma.inscricaoAtividade.count({
      where: {
        id_atividade: dto.id_atividade,
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

    return this.prisma.inscricaoAtividade.create({
      data: {
        id_inscricao_edicao: inscricaoEdicao.id_inscricao_edicao,
        id_atividade: dto.id_atividade,
        status: 'Inscrito',
      },
    });
  }

  async registrarChamada(itens: RegistrarPresencaItemDto[], usuarioId?: number) {
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
