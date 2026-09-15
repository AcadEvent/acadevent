import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarEventoDto } from './dto/criar-evento.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPublicos() {
    return this.prisma.edicao.findMany({
      where: {
        status_evento: {
          in: ['Publicado', 'Ativo'],
        },
      },
      include: {
        evento: true,
        lotes: {
          select: {
            id_lote: true,
            nome_lote: true,
            preco: true,
            numero_max_ingressos: true,
            data_abertura_lote: true,
            data_encerramento_lote: true,
          },
        },
      },
      orderBy: {
        data_abertura_evento: 'asc',
      },
    });
  }

  async buscarPorSlug(slug: string) {
    const slugLimpo = slug.trim().toLowerCase();

    let edicao = await this.prisma.edicao.findFirst({
      where: {
        sigla: {
          equals: slugLimpo,
          mode: 'insensitive',
        },
      },
      include: {
        evento: true,
        lotes: true,
        cupons: true,
        espacos: true,
        atividades: {
          include: {
            atividadesMinistrantes: {
              include: {
                ministrante: {
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
              },
            },
            reservas: {
              include: {
                espaco: true,
              },
            },
          },
        },
      },
    });

    if (!edicao && !isNaN(Number(slug))) {
      edicao = await this.prisma.edicao.findUnique({
        where: { id_edicao: Number(slug) },
        include: {
          evento: true,
          lotes: true,
          cupons: true,
          espacos: true,
          atividades: {
            include: {
              atividadesMinistrantes: {
                include: {
                  ministrante: {
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
                },
              },
              reservas: {
                include: {
                  espaco: true,
                },
              },
            },
          },
        },
      });
    }

    if (!edicao) {
      throw new NotFoundException(`Evento com identificador '${slug}' nao encontrado.`);
    }

    return edicao;
  }

  async criarEvento(usuarioId: number, dto: CriarEventoDto) {
    if (new Date(dto.data_encerramento_evento) <= new Date(dto.data_abertura_evento)) {
      throw new BadRequestException(
        'A data de encerramento do evento deve ser posterior a data de abertura.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let perfilOrg = await tx.perfilOrganizador.findUnique({
        where: { id_usuario: usuarioId },
      });

      if (!perfilOrg) {
        perfilOrg = await tx.perfilOrganizador.create({
          data: { id_usuario: usuarioId },
        });

        const perfilExiste = await tx.perfilUsuario.findFirst({
          where: { id_usuario: usuarioId, tipo_perfil: 'organizador' },
        });

        if (!perfilExiste) {
          await tx.perfilUsuario.create({
            data: { id_usuario: usuarioId, tipo_perfil: 'organizador' },
          });
        }
      }

      const evento = await tx.evento.create({
        data: {
          id_organizador: perfilOrg.id_organizador,
          nome_marca: dto.nome_marca,
          descricao_geral: dto.descricao_geral,
        },
      });

      const edicao = await tx.edicao.create({
        data: {
          id_evento: evento.id_evento,
          titulo_oficial: dto.titulo_oficial,
          sigla: dto.sigla.trim().toLowerCase(),
          unidade_promotora: dto.unidade_promotora,
          area_tematica: dto.area_tematica,
          descricao_geral: dto.descricao_geral,
          data_abertura_evento: new Date(dto.data_abertura_evento),
          data_encerramento_evento: new Date(dto.data_encerramento_evento),
          capacidade_max_participantes: dto.capacidade_max_participantes,
          endereco: dto.endereco,
          status_evento: 'Publicado',
        },
      });

      return { evento, edicao };
    });
  }

  async listarPorOrganizador(usuarioId: number) {
    const perfilOrg = await this.prisma.perfilOrganizador.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (!perfilOrg) {
      return [];
    }

    return this.prisma.edicao.findMany({
      where: {
        evento: {
          id_organizador: perfilOrg.id_organizador,
        },
      },
      include: {
        evento: true,
        _count: {
          select: {
            lotes: true,
            atividades: true,
          },
        },
      },
      orderBy: {
        id_edicao: 'desc',
      },
    });
  }

  async atualizarStatus(idEdicao: number, dto: AtualizarStatusDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: idEdicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    return this.prisma.edicao.update({
      where: { id_edicao: idEdicao },
      data: { status_evento: dto.status },
    });
  }
}
