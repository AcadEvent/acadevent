import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Cupom } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CriarInscricaoDto } from './dto/criar-inscricao.dto';
import { WebhookPagamentoDto } from '../pagamentos/dto/webhook-pagamento.dto';

@Injectable()
export class InscricoesService {
  constructor(private readonly prisma: PrismaService) {}

  async criarInscricao(usuarioId: number, dto: CriarInscricaoDto) {
    const lote = await this.prisma.loteIngresso.findUnique({
      where: { id_lote: dto.id_lote },
    });

    if (!lote) {
      throw new NotFoundException('Lote de ingresso não encontrado.');
    }

    const dataAtual = new Date();
    if (lote.data_abertura_lote && dataAtual < lote.data_abertura_lote) {
      throw new BadRequestException(
        'O lote ainda não está aberto para inscrições.',
      );
    }
    if (
      lote.data_encerramento_lote &&
      dataAtual > lote.data_encerramento_lote
    ) {
      throw new BadRequestException(
        'O lote já está encerrado para inscrições.',
      );
    }

    const inscricoesAtivas = await this.prisma.inscricaoEdicao.count({
      where: {
        id_lote: dto.id_lote,
        status: { not: 'Cancelada' },
      },
    });

    if (inscricoesAtivas >= lote.numero_max_ingressos) {
      throw new BadRequestException(
        'Limite máximo de ingressos deste lote atingido.',
      );
    }

    const perfilParticipante = await this.prisma.perfilParticipante.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (!perfilParticipante) {
      throw new ForbiddenException(
        'Perfil de participante não encontrado para o usuário atual.',
      );
    }

    let cupom: Cupom | null = null;
    let valorFinal = new Prisma.Decimal(lote.preco);

    if (dto.codigo_cupom) {
      cupom = await this.prisma.cupom.findUnique({
        where: { codigo: dto.codigo_cupom },
      });

      if (!cupom) {
        throw new NotFoundException('Cupom inválido ou não encontrado.');
      }
      if (cupom.quantidade_uso >= cupom.limite_usos) {
        throw new BadRequestException(
          'O limite de usos deste cupom foi atingido.',
        );
      }

      const percentualDecimal = new Prisma.Decimal(
        cupom.percentual_desconto,
      ).dividedBy(100);
      const desconto = valorFinal.times(percentualDecimal);
      valorFinal = valorFinal.minus(desconto);
    }

    return this.prisma.$transaction(async (tx) => {
      if (cupom) {
        await tx.cupom.update({
          where: { id_cupom: cupom.id_cupom },
          data: { quantidade_uso: { increment: 1 } },
        });
      }

      const inscricao = await tx.inscricaoEdicao.create({
        data: {
          id_participante: perfilParticipante.id_participante,
          id_lote: lote.id_lote,
          id_cupom: cupom ? cupom.id_cupom : null,
          status: 'Pendente',
        },
      });

      const pagamento = await tx.pagamento.create({
        data: {
          id_inscricao_edicao: inscricao.id_inscricao_edicao,
          valor: valorFinal,
          status: 'Pendente',
        },
      });

      return { inscricao, pagamento };
    });
  }

  async processarWebhook(dto: WebhookPagamentoDto) {
    const pagamento = await this.prisma.pagamento.findFirst({
      where: { gateway_id: dto.gateway_id },
    });

    if (!pagamento) {
      throw new NotFoundException(
        'Transação não encontrada pelo gateway_id fornecido.',
      );
    }

    if (dto.status === 'Aprovado') {
      const hash = crypto.randomBytes(16).toString('hex');

      return this.prisma.$transaction(async (tx) => {
        const pagAtualizado = await tx.pagamento.update({
          where: { id_pagamento: pagamento.id_pagamento },
          data: { status: 'Aprovado' },
        });

        const inscricaoAtualizada = await tx.inscricaoEdicao.update({
          where: { id_inscricao_edicao: pagamento.id_inscricao_edicao },
          data: {
            status: 'Confirmada',
            url_qrcode: hash,
          },
        });

        return { pagamento: pagAtualizado, inscricao: inscricaoAtualizada };
      });
    }

    return this.prisma.pagamento.update({
      where: { id_pagamento: pagamento.id_pagamento },
      data: { status: dto.status },
    });
  }
}
