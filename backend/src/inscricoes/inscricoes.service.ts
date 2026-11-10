import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Cupom } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { spRealizarInscricaoEdicao } from '../prisma/procedures';
import { CriarInscricaoDto } from './dto/criar-inscricao.dto';
import { CriarLoteDto } from './dto/criar-lote.dto';
import { CriarCupomDto } from './dto/criar-cupom.dto';
import { WebhookPagamentoDto } from '../pagamentos/dto/webhook-pagamento.dto';

@Injectable()
export class InscricoesService {
  private readonly credenciados = new Set<string>();

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
      throw new BadRequestException(
        'Ja existe um cupom cadastrado com este codigo.',
      );
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

  /**
   * Inscricoes de uma edicao para a gestao do evento (RF04.1): participante,
   * lote, cupom, pagamento e quantidade de atividades. Expoe nome e e-mail dos
   * participantes, entao so o organizador do evento ou um administrador le.
   */
  async listarInscricoesPorEdicao(
    idEdicao: number,
    usuario: { id_usuario: number; perfis?: string[] },
  ) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: idEdicao },
      include: { evento: { include: { organizador: true } } },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    const ehAdmin = (usuario.perfis ?? []).some(
      (p) => typeof p === 'string' && p.toLowerCase() === 'administrador',
    );
    const ehOrganizadorDoEvento =
      edicao.evento?.organizador?.id_usuario === usuario.id_usuario;

    if (!ehAdmin && !ehOrganizadorDoEvento) {
      throw new ForbiddenException(
        'Apenas o organizador do evento ou administradores podem ver as inscricoes.',
      );
    }

    const inscricoes = await this.prisma.inscricaoEdicao.findMany({
      where: { lote: { id_edicao: idEdicao } },
      include: {
        participante: {
          include: { usuario: { select: { nome: true, email: true } } },
        },
        lote: true,
        cupom: true,
        pagamentos: { orderBy: { id_pagamento: 'desc' }, take: 1 },
        _count: { select: { inscricoesAtividades: true } },
      },
      orderBy: { id_inscricao_edicao: 'desc' },
    });

    return inscricoes.map((i) => {
      const pagamento = i.pagamentos[0];
      return {
        id_inscricao_edicao: i.id_inscricao_edicao,
        status: i.status,
        participante: {
          nome: i.participante.usuario.nome,
          email: i.participante.usuario.email,
        },
        lote: {
          id_lote: i.lote.id_lote,
          nome_lote: i.lote.nome_lote,
          preco: Number(i.lote.preco),
        },
        cupom: i.cupom
          ? {
              codigo: i.cupom.codigo,
              percentual_desconto: i.cupom.percentual_desconto,
            }
          : null,
        pagamento: pagamento
          ? {
              status: pagamento.status,
              valor: Number(pagamento.valor),
              metodo_pagamento: pagamento.metodo_pagamento,
              data_pagamento: pagamento.data_pagamento,
            }
          : null,
        atividades_inscritas: i._count.inscricoesAtividades,
      };
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

      if (cupom.id_edicao !== lote.id_edicao) {
        throw new BadRequestException('Cupom invalido para esta edicao.');
      }

      const percentualDecimal = new Prisma.Decimal(
        cupom.percentual_desconto,
      ).dividedBy(100);
      const desconto = valorFinal.times(percentualDecimal);
      valorFinal = valorFinal.minus(desconto);
    }

    const isGratuito = valorFinal.lte(0);

    return this.prisma.$transaction(async (tx) => {
      // Uma inscricao ativa por participante em cada evento. O lock serializa
      // envios simultaneos (duplo clique, voltar e reenviar): sem ele, os dois
      // passariam pela checagem abaixo antes de qualquer um gravar.
      // $executeRaw (e nao $queryRaw): a funcao devolve void, que o Prisma nao
      // consegue desserializar numa consulta.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${perfilParticipante.id_participante}::int, ${lote.id_edicao}::int)`;

      const inscricaoAtiva = await tx.inscricaoEdicao.findFirst({
        where: {
          id_participante: perfilParticipante.id_participante,
          status: { notIn: ['Cancelada', 'Estornada'] },
          lote: { id_edicao: lote.id_edicao },
        },
      });

      if (inscricaoAtiva) {
        throw new ConflictException(
          inscricaoAtiva.status === 'Confirmada'
            ? 'Voce ja esta inscrito neste evento.'
            : 'Voce ja possui uma inscricao pendente neste evento. Conclua o pagamento dela.',
        );
      }

      const inscricao = await spRealizarInscricaoEdicao(tx, {
        id_participante: perfilParticipante.id_participante,
        id_lote: lote.id_lote,
        id_cupom: cupom ? cupom.id_cupom : null,
      });

      let inscricaoFinal = inscricao;
      if (isGratuito) {
        const hash = crypto.randomBytes(16).toString('hex');
        inscricaoFinal = await tx.inscricaoEdicao.update({
          where: { id_inscricao_edicao: inscricao.id_inscricao_edicao },
          data: {
            status: 'Confirmada',
            url_qrcode: hash,
          },
        });
      }

      const pagamento = await tx.pagamento.create({
        data: {
          id_inscricao_edicao: inscricao.id_inscricao_edicao,
          valor: valorFinal,
          status: isGratuito ? 'Aprovado' : 'Pendente',
          data_pagamento: isGratuito ? new Date() : null,
        },
      });

      return { inscricao: inscricaoFinal, pagamento };
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
            usuario: {
              select: {
                id_usuario: true,
                nome: true,
                email: true,
                url_foto: true,
              },
            },
          },
        },
        lote: true,
      },
    });

    if (!inscricao) {
      throw new NotFoundException(
        'Inscricao invalida ou QR Code nao encontrado.',
      );
    }

    if (inscricao.status !== 'Confirmada') {
      throw new BadRequestException(
        `Inscricao nao esta confirmada. Status atual: ${inscricao.status}`,
      );
    }

    if (this.credenciados.has(urlQrcode)) {
      throw new BadRequestException(
        'QR Code ja utilizado para credenciamento.',
      );
    }

    this.credenciados.add(urlQrcode);

    if (inscricao.participante?.usuario) {
      delete (inscricao.participante.usuario as Record<string, unknown>)
        .senha_hash;
    }

    return {
      valido: true,
      credenciado: true,
      inscricao,
    };
  }
}
