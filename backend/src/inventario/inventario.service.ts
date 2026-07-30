import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarItemInventarioDto } from './dto/criar-item-inventario.dto';
import { RetirarItemDto } from './dto/retirar-item.dto';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  async criarItem(dto: CriarItemInventarioDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: dto.id_edicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    return this.prisma.itemInventarioFisico.create({
      data: {
        id_edicao: dto.id_edicao,
        tipo_item: dto.tipo_item,
        quantidade_total: dto.quantidade_total,
        quantidade_disponivel: dto.quantidade_total,
        quantidade_minima: dto.quantidade_minima,
        descricao: dto.descricao,
      },
    });
  }

  async listarItensPorEdicao(idEdicao: number) {
    return this.prisma.itemInventarioFisico.findMany({
      where: { id_edicao: idEdicao },
      orderBy: { id_item: 'asc' },
    });
  }

  async retirarItem(dto: RetirarItemDto) {
    const item = await this.prisma.itemInventarioFisico.findUnique({
      where: { id_item: dto.id_item },
    });

    if (!item) {
      throw new NotFoundException('Item de inventario nao encontrado.');
    }

    if (dto.quantidade_retirada > item.quantidade_disponivel) {
      throw new BadRequestException(
        `Quantidade solicitada (${dto.quantidade_retirada}) e superior a quantidade disponivel em estoque (${item.quantidade_disponivel}).`,
      );
    }

    const organizador = await this.prisma.perfilOrganizador.findUnique({
      where: { id_organizador: dto.id_organizador },
    });

    if (!organizador) {
      throw new NotFoundException('Perfil de organizador responsavel nao encontrado.');
    }

    if (dto.id_ministrante) {
      const ministrante = await this.prisma.perfilMinistrante.findUnique({
        where: { id_ministrante: dto.id_ministrante },
      });
      if (!ministrante) {
        throw new NotFoundException('Perfil de ministrante nao encontrado.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const itemAtualizado = await tx.itemInventarioFisico.update({
        where: { id_item: dto.id_item },
        data: {
          quantidade_disponivel: { decrement: dto.quantidade_retirada },
        },
      });

      const registro = await tx.registroInventario.create({
        data: {
          id_item: dto.id_item,
          id_organizador: dto.id_organizador,
          id_ministrante: dto.id_ministrante || null,
          data_retirada: new Date(),
          status: 'Retirado',
          quantidade_retirada: dto.quantidade_retirada,
        },
      });

      return {
        registro,
        item: itemAtualizado,
      };
    });
  }

  async devolverItem(idRegistroItem: number) {
    const registro = await this.prisma.registroInventario.findUnique({
      where: { id_registro_item: idRegistroItem },
    });

    if (!registro) {
      throw new NotFoundException('Registro de movimentacao nao encontrado.');
    }

    if (registro.status === 'Devolvido') {
      throw new BadRequestException(
        'Este item ja consta como devolvido no sistema.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const registroAtualizado = await tx.registroInventario.update({
        where: { id_registro_item: idRegistroItem },
        data: {
          data_entrega: new Date(),
          status: 'Devolvido',
        },
      });

      const itemAtualizado = await tx.itemInventarioFisico.update({
        where: { id_item: registro.id_item },
        data: {
          quantidade_disponivel: { increment: registro.quantidade_retirada },
        },
      });

      return {
        registro: registroAtualizado,
        item: itemAtualizado,
      };
    });
  }

  async obterAlertasEstoqueCritico(idEdicao: number) {
    const itens = await this.prisma.itemInventarioFisico.findMany({
      where: {
        id_edicao: idEdicao,
      },
    });

    return itens.filter(
      (item) => item.quantidade_disponivel <= item.quantidade_minima,
    );
  }

  async gerarRelatorioInventario(idEdicao: number) {
    const itens = await this.prisma.itemInventarioFisico.findMany({
      where: { id_edicao: idEdicao },
      include: {
        registros: {
          include: {
            ministrante: {
              include: {
                usuario: {
                  select: { nome: true },
                },
              },
            },
          },
          orderBy: { data_retirada: 'desc' },
        },
      },
      orderBy: { id_item: 'asc' },
    });

    return itens;
  }
}
