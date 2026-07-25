import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InscreverAtividadeDto } from './dto/inscrever-atividade.dto';
import { RegistrarPresencaItemDto } from './dto/registrar-presenca.dto';

@Injectable()
export class AtividadesService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new NotFoundException('Atividade não encontrada.');
    }

    const perfilParticipante = await this.prisma.perfilParticipante.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (!perfilParticipante) {
      throw new ForbiddenException(
        'Perfil de participante não encontrado para este usuário.',
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
        'Precondição financeira não atendida: inscrição no evento não confirmada.',
      );
    }

    const inscritosAtuais = await this.prisma.inscricaoAtividade.count({
      where: {
        id_atividade: dto.id_atividade,
      },
    });

    const reserva = atividade.reservas[0];
    if (reserva && reserva.espaco) {
      const capacidadeMax = reserva.espaco.capacidade_max;
      if (inscritosAtuais >= capacidadeMax) {
        throw new BadRequestException(
          'Lotação máxima do espaço físico atingida.',
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

  async registrarChamada(itens: RegistrarPresencaItemDto[]) {
    if (!itens || itens.length === 0) {
      throw new BadRequestException(
        'A lista de chamadas não pode estar vazia.',
      );
    }

    const presencasData: Prisma.PresencaCreateManyInput[] = [];

    for (const item of itens) {
      const inscricaoAtividade =
        await this.prisma.inscricaoAtividade.findUnique({
          where: { id_inscricao_atividade: item.id_inscricao_atividade },
        });

      if (!inscricaoAtividade) {
        throw new NotFoundException(
          `Inscrição em atividade ID ${item.id_inscricao_atividade} não encontrada.`,
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
