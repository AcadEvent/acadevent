import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarEventoDto } from './dto/criar-evento.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';

export const DETALHES_EDICAO_INCLUDE = {
  evento: true,
  lotes: true,
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
} as const;

const TRANSICOES_STATUS_VALIDAS: Record<string, string[]> = {
  Rascunho: ['Publicado', 'Arquivado'],
  Publicado: ['Em andamento', 'Encerrado', 'Arquivado', 'Rascunho'],
  Ativo: ['Em andamento', 'Encerrado', 'Arquivado', 'Rascunho'],
  'Em andamento': ['Encerrado', 'Arquivado'],
  Encerrado: ['Arquivado'],
  Arquivado: [],
};

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  private anexarSlug<T extends { sigla?: string | null; id_edicao?: number }>(
    edicao: T,
  ): T & { slug: string } {
    if (!edicao) return edicao as T & { slug: string };
    return {
      ...edicao,
      slug: edicao.sigla || String(edicao.id_edicao),
    };
  }

  async listarPublicos() {
    const edicoes = await this.prisma.edicao.findMany({
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
    return edicoes.map((e) => this.anexarSlug(e));
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
      include: DETALHES_EDICAO_INCLUDE,
    });

    if (!edicao && !isNaN(Number(slug))) {
      edicao = await this.prisma.edicao.findUnique({
        where: { id_edicao: Number(slug) },
        include: DETALHES_EDICAO_INCLUDE,
      });
    }

    if (!edicao) {
      throw new NotFoundException(
        `Evento com identificador '${slug}' nao encontrado.`,
      );
    }

    return this.anexarSlug(edicao);
  }

  async criarEvento(usuarioId: number, dto: CriarEventoDto) {
    if (
      new Date(dto.data_encerramento_evento) <=
      new Date(dto.data_abertura_evento)
    ) {
      throw new BadRequestException(
        'A data de encerramento do evento deve ser posterior a data de abertura.',
      );
    }

    const siglaFinal = (dto.sigla || dto.slug || '').trim().toLowerCase();
    if (!siglaFinal) {
      throw new BadRequestException(
        'A sigla ou slug do evento deve ser informada.',
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
          sigla: siglaFinal,
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

      return { evento, edicao: this.anexarSlug(edicao) };
    });
  }

  async listarPorOrganizador(usuarioId: number) {
    const perfilOrg = await this.prisma.perfilOrganizador.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (!perfilOrg) {
      return [];
    }

    const edicoes = await this.prisma.edicao.findMany({
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

    return edicoes.map((e) => this.anexarSlug(e));
  }

  async atualizarStatus(
    idEdicao: number,
    dto: AtualizarStatusDto,
    usuario?: { id_usuario: number; perfis?: string[] },
  ) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: idEdicao },
      include: {
        evento: {
          include: {
            organizador: true,
          },
        },
      },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    if (usuario) {
      const perfis = Array.isArray(usuario.perfis)
        ? usuario.perfis.map((p) =>
            typeof p === 'string' ? p.toLowerCase() : '',
          )
        : [];
      let isAdmin = perfis.includes('administrador');

      if (!isAdmin && this.prisma.perfilAdministrador) {
        const perfilAdmin = await this.prisma.perfilAdministrador.findUnique({
          where: { id_usuario: usuario.id_usuario },
        });
        if (perfilAdmin) {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        let isOrganizador = false;

        if (edicao.evento?.organizador?.id_usuario === usuario.id_usuario) {
          isOrganizador = true;
        } else if (edicao.evento?.id_organizador) {
          const perfilOrg = await this.prisma.perfilOrganizador.findUnique({
            where: { id_usuario: usuario.id_usuario },
          });
          if (
            perfilOrg &&
            perfilOrg.id_organizador === edicao.evento.id_organizador
          ) {
            isOrganizador = true;
          }
        }

        if (!isOrganizador) {
          throw new ForbiddenException(
            'Apenas o organizador do evento ou administradores podem atualizar o status.',
          );
        }
      }
    }

    const statusAtual = edicao.status_evento || 'Publicado';
    if (statusAtual !== dto.status) {
      const permitidos = TRANSICOES_STATUS_VALIDAS[statusAtual];
      if (!permitidos || !permitidos.includes(dto.status)) {
        throw new BadRequestException(
          `Transição de status inválida de '${statusAtual}' para '${dto.status}'.`,
        );
      }
    }

    const atualizado = await this.prisma.edicao.update({
      where: { id_edicao: idEdicao },
      data: { status_evento: dto.status },
    });
    return this.anexarSlug(atualizado);
  }
}
