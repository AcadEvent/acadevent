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
import { CriarLoteDto } from './dto/criar-lote.dto';
import { CriarCupomDto } from './dto/criar-cupom.dto';
import { WebhookPagamentoDto } from '../pagamentos/dto/webhook-pagamento.dto';

@Injectable()
export class InscricoesService {
  constructor(private readonly prisma: PrismaService) {}

  async criarLote(dto: CriarLoteDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: dto.id_edicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    return this.prisma.loteIngresso.create({
      data: {
        id_edicao: dto.id_edicao,
        nome_lote: dto.nome_lote,
        data_abertura_lote: dto.data_abertura_lote,
        data_encerramento_lote: dto.data_encerramento_lote,
        preco: new Prisma.Decimal(dto.preco),
        numero_max_ingressos: dto.numero_max_ingressos,
      },
    });
  }

  async listarLotesPorEdicao(idEdicao: number) {
    return this.prisma.loteIngresso.findMany({
      where: { id_edicao: idEdicao },
      orderBy: { id_lote: 'asc' },
    });
  }

  async criarCupom(dto: CriarCupomDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: dto.id_edicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    const cupomExistente = await this.prisma.cupom.findUnique({
      where: { codigo: dto.codigo },
    });

    if (cupomExistente) {
      throw new BadRequestException('Ja existe um cupom cadastrado com este codigo.');
    }

    return this.prisma.cupom.create({
      data: {
        id_edicao: dto.id_edicao,
        codigo: dto.codigo,
        percentual_desconto: dto.percentual_desconto,
        limite_usos: dto.limite_usos,
        quantidade_uso: 0,
      },
    });
  }

  async listarCuponsPorEdicao(idEdicao: number) {
    return this.prisma.cupom.findMany({
      where: { id_edicao: idEdicao },
      orderBy: { id_cupom: 'asc' },
    });
  }

  async criarInscricao(usuarioId: number, dto: CriarInscricaoDto) {
    const lote = await this.prisma.loteIngresso.findUnique({
      where: { id_lote: dto.id_lote },
    });

    if (!lote) {
      throw new NotFoundException('Lote de ingresso nao encontrado.');
    }

    const dataAtual = new Date();
    if (lote.data_abertura_lote && dataAtual < lote.data_abertura_lote) {
      throw new BadRequestException(
        'O lote ainda nao esta aberto para inscricoes.',
      );
    }
    if (
      lote.data_encerramento_lote &&
      dataAtual > lote.data_encerramento_lote
    ) {
      throw new BadRequestException(
        'O lote ja esta encerrado para inscricoes.',
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
        'Limite maximo de ingressos deste lote atingido.',
      );
    }

    const perfilParticipante = await this.prisma.perfilParticipante.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (!perfilParticipante) {
      throw new ForbiddenException(
        'Perfil de participante nao encontrado para o usuario atual.',
      );
    }

    let cupom: Cupom | null = null;
    let valorFinal = new Prisma.Decimal(lote.preco);

    if (dto.codigo_cupom) {
      cupom = await this.prisma.cupom.findUnique({
        where: { codigo: dto.codigo_cupom },
      });

      if (!cupom) {
        throw new NotFoundException('Cupom invalido ou nao encontrado.');
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
        'Transacao nao encontrada pelo gateway_id fornecido.',
      );
    }

    if (dto.status === 'Aprovado') {
      const hash = crypto.randomBytes(16).toString('hex');

      return this.prisma.$transaction(async (tx) => {
        const pagAtualizado = await tx.pagamento.update({
          where: { id_pagamento: pagamento.id_pagamento },
          data: { status: 'Aprovado', data_pagamento: new Date() },
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

    if (dto.status !== 'Cancelado' && dto.status !== 'Estornado') {
      return this.prisma.pagamento.update({
        where: { id_pagamento: pagamento.id_pagamento },
        data: { status: dto.status },
      });
    }
    const novoStatusInscricao =
      dto.status === 'Cancelado' ? 'Cancelada' : 'Estornada';
    return this.prisma.$transaction(async (tx) => {
      const pagAtualizado = await tx.pagamento.update({
        where: { id_pagamento: pagamento.id_pagamento },
        data: { status: dto.status },
      });
      const inscricaoAtualizada = await tx.inscricaoEdicao.update({
        where: { id_inscricao_edicao: pagamento.id_inscricao_edicao },
        data: { status: novoStatusInscricao },
      });
      return { pagamento: pagAtualizado, inscricao: inscricaoAtualizada };
    });
  }

  async validarQrCode(urlQrcode: string) {
    const inscricao = await this.prisma.inscricaoEdicao.findFirst({
      where: { url_qrcode: urlQrcode },
      include: {
        participante: {
          include: {
            usuario: true,
          },
        },
        lote: true,
      },
    });

    if (!inscricao) {
      throw new NotFoundException('Inscricao invalida ou QR Code nao encontrado.');
    }

    if (inscricao.status !== 'Confirmada') {
      throw new BadRequestException(
        `Inscricao nao esta confirmada. Status atual: ${inscricao.status}`,
      );
    }

    return {
      valido: true,
      inscricao,
    };
  }
}
