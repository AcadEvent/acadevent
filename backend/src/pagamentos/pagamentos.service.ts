import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmarPagamentoManualDto } from './dto/confirmar-pagamento-manual.dto';

@Injectable()
export class PagamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async confirmarManual(dto: ConfirmarPagamentoManualDto) {
    const inscricao = await this.prisma.inscricaoEdicao.findUnique({
      where: { id_inscricao_edicao: dto.id_inscricao_edicao },
      include: { pagamentos: true },
    });

    if (!inscricao) {
      throw new NotFoundException('Inscricao nao encontrada.');
    }

    if (inscricao.status === 'Confirmada') {
      throw new BadRequestException('Esta inscricao ja se encontra confirmada.');
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

    const inscricoes = await this.prisma.inscricaoEdicao.findMany({
      where: {
        lote: {
          id_edicao: idEdicao,
        },
      },
      include: {
        pagamentos: true,
        lote: true,
      },
    });

    let receitaTotalConfirmada = new Prisma.Decimal(0);
    let valorTotalPendente = new Prisma.Decimal(0);
    let totalConfirmadas = 0;
    let totalPendentes = 0;
    let totalCanceladas = 0;

    for (const inscricao of inscricoes) {
      if (inscricao.status === 'Confirmada') {
        totalConfirmadas++;
        for (const pag of inscricao.pagamentos) {
          if (pag.status === 'Aprovado') {
            receitaTotalConfirmada = receitaTotalConfirmada.plus(pag.valor);
          }
        }
      } else if (inscricao.status === 'Pendente') {
        totalPendentes++;
        for (const pag of inscricao.pagamentos) {
          valorTotalPendente = valorTotalPendente.plus(pag.valor);
        }
      } else if (inscricao.status === 'Cancelada') {
        totalCanceladas++;
      }
    }

    return {
      id_edicao: idEdicao,
      titulo_oficial: edicao.titulo_oficial,
      resumo_inscricoes: {
        total: inscricoes.length,
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
