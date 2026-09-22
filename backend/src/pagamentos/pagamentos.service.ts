import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmarPagamentoManualDto } from './dto/confirmar-pagamento-manual.dto';
import { WebhookPagamentoDto } from './dto/webhook-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async processarWebhook(dto: WebhookPagamentoDto) {
    const pagamento = await this.prisma.pagamento.findFirst({
      where: { gateway_id: dto.gateway_id },
      include: { inscricao: true },
    });

    if (!pagamento) {
      throw new NotFoundException(
        'Transacao nao encontrada pelo gateway_id fornecido.',
      );
    }

    // Idempotência: reenvio de 'Aprovado' para pagamento já aprovado não recria o url_qrcode
    if (pagamento.status === 'Aprovado' && dto.status === 'Aprovado') {
      return {
        pagamento,
        inscricao: pagamento.inscricao,
      };
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

  async confirmarManual(dto: ConfirmarPagamentoManualDto) {
    const inscricao = await this.prisma.inscricaoEdicao.findUnique({
      where: { id_inscricao_edicao: dto.id_inscricao_edicao },
      include: { pagamentos: true },
    });

    if (!inscricao) {
      throw new NotFoundException('Inscricao nao encontrada.');
    }

    if (inscricao.status === 'Confirmada') {
      throw new BadRequestException(
        'Esta inscricao ja se encontra confirmada.',
      );
    }

    const hashQrCode = crypto.randomBytes(16).toString('hex');
    const codigoRecibo = `REC-${Date.now()}-${dto.id_inscricao_edicao}`;

    return this.prisma.$transaction(async (tx) => {
      const inscricaoAtualizada = await tx.inscricaoEdicao.update({
        where: { id_inscricao_edicao: dto.id_inscricao_edicao },
        data: {
          status: 'Confirmada',
          url_qrcode: hashQrCode,
        },
      });

      let pagamento = inscricao.pagamentos[0];

      if (pagamento) {
        pagamento = await tx.pagamento.update({
          where: { id_pagamento: pagamento.id_pagamento },
          data: {
            status: 'Aprovado',
            metodo_pagamento: 'Manual / Balcao',
            url_recibo: codigoRecibo,
            data_pagamento: new Date(),
          },
        });
      } else {
        pagamento = await tx.pagamento.create({
          data: {
            id_inscricao_edicao: dto.id_inscricao_edicao,
            status: 'Aprovado',
            metodo_pagamento: 'Manual / Balcao',
            url_recibo: codigoRecibo,
            valor: new Prisma.Decimal(0),
            data_pagamento: new Date(),
          },
        });
      }

      return {
        inscricao: inscricaoAtualizada,
        pagamento,
      };
    });
  }

  async gerarRelatorioFinanceiro(idEdicao: number) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: idEdicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    const [contagemStatus, somaAprovados, somaPendentes] = await Promise.all([
      this.prisma.inscricaoEdicao.groupBy({
        by: ['status'],
        where: {
          lote: { id_edicao: idEdicao },
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.pagamento.aggregate({
        where: {
          status: 'Aprovado',
          inscricao: {
            status: 'Confirmada',
            lote: { id_edicao: idEdicao },
          },
        },
        _sum: {
          valor: true,
        },
      }),
      this.prisma.pagamento.aggregate({
        where: {
          inscricao: {
            status: 'Pendente',
            lote: { id_edicao: idEdicao },
          },
        },
        _sum: {
          valor: true,
        },
      }),
    ]);

    let totalConfirmadas = 0;
    let totalPendentes = 0;
    let totalCanceladas = 0;
    let totalInscricoes = 0;

    for (const item of contagemStatus) {
      const count = item._count._all;
      totalInscricoes += count;
      if (item.status === 'Confirmada') {
        totalConfirmadas = count;
      } else if (item.status === 'Pendente') {
        totalPendentes = count;
      } else if (item.status === 'Cancelada') {
        totalCanceladas = count;
      }
    }

    const receitaTotalConfirmada =
      somaAprovados._sum.valor || new Prisma.Decimal(0);
    const valorTotalPendente =
      somaPendentes._sum.valor || new Prisma.Decimal(0);

    return {
      id_edicao: idEdicao,
      titulo_oficial: edicao.titulo_oficial,
      resumo_inscricoes: {
        total: totalInscricoes,
        confirmadas: totalConfirmadas,
        pendentes: totalPendentes,
        canceladas: totalCanceladas,
      },
      resumo_financeiro: {
        receita_total_confirmada: receitaTotalConfirmada,
        valor_total_pendente: valorTotalPendente,
      },
    };
  }
}
