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

export function normalizarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function gerarSlugBase(
  sigla?: string | null,
  numeroEdicao?: string | null,
  nome?: string | null,
): string {
  let base = '';
  const siglaLimpa = sigla ? sigla.trim() : '';
  const edicaoLimpa = numeroEdicao ? numeroEdicao.trim() : '';

  if (siglaLimpa && edicaoLimpa) {
    base = `${siglaLimpa}-${edicaoLimpa}`;
  } else if (siglaLimpa) {
    base = siglaLimpa;
  } else if (nome && nome.trim()) {
    base = nome.trim();
  } else {
    base = 'evento';
  }

  const normalizado = normalizarSlug(base);
  return normalizado || 'evento';
}

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  private anexarSlug<
    T extends {
      slug?: string | null;
      sigla?: string | null;
      id_edicao?: number;
    },
  >(edicao: T): T & { slug: string } {
    if (!edicao) return edicao;
    return {
      ...edicao,
      slug: edicao.slug || edicao.sigla || String(edicao.id_edicao),
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
        OR: [
          {
            slug: {
              equals: slugLimpo,
              mode: 'insensitive',
            },
          },
          {
            sigla: {
              equals: slugLimpo,
              mode: 'insensitive',
            },
          },
        ],
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

    const siglaPreservada = dto.sigla?.trim() || dto.slug?.trim() || null;

    return this.prisma.$transaction(async (tx) => {
      let slugFinal: string;
      if (dto.slug && dto.slug.trim()) {
        slugFinal = normalizarSlug(dto.slug.trim());
      } else {
        const slugBase = gerarSlugBase(
          dto.sigla,
          dto.numero_edicao,
          dto.titulo_oficial || dto.nome_marca,
        );
        slugFinal = slugBase;
        let contador = 2;
        while (
          await tx.edicao.findFirst({
            where: {
              slug: {
                equals: slugFinal,
                mode: 'insensitive',
              },
            },
          })
        ) {
          slugFinal = `${slugBase}-${contador}`;
          contador++;
        }
      }

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
          numero_edicao: dto.numero_edicao ? dto.numero_edicao.trim() : null,
          sigla: siglaPreservada,
          slug: slugFinal,
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

  /** Edicoes em que o usuario tem inscricao ativa (RF03.1.1). */
  async listarPorParticipante(idUsuario: number) {
    const edicoes = await this.prisma.edicao.findMany({
      where: {
        lotes: {
          some: {
            inscricoes: {
              some: {
                participante: { id_usuario: idUsuario },
                status: { notIn: ['Cancelada', 'Estornada'] },
              },
            },
          },
        },
      },
      orderBy: {
        data_abertura_evento: 'desc',
      },
    });

    return edicoes.map((e) => this.anexarSlug(e));
  }

  /**
   * Painel pessoal do usuario em um evento (RF03.1.1): situacao da inscricao,
   * papeis, grade de atividades e contadores de recibos/certificados.
   * Responde 404 quando o usuario nao tem inscricao ativa na edicao.
   */
  async buscarPainelParticipante(idUsuario: number, slug: string) {
    const edicao = this.anexarSlug(await this.buscarPorSlug(slug));

    const inscricoes = await this.prisma.inscricaoEdicao.findMany({
      where: {
        participante: { id_usuario: idUsuario },
        lote: { id_edicao: edicao.id_edicao },
        status: { notIn: ['Cancelada', 'Estornada'] },
      },
      include: {
        pagamentos: true,
        inscricoesAtividades: {
          where: { status: { not: 'Cancelada' } },
          include: {
            atividade: {
              include: { reservas: { include: { espaco: true } } },
            },
          },
        },
      },
      orderBy: { id_inscricao_edicao: 'asc' },
    });

    if (inscricoes.length === 0) {
      throw new NotFoundException('Voce nao participa deste evento.');
    }

    const [certificados, comoMinistrante] = await Promise.all([
      this.prisma.certificado.count({
        where: { id_usuario: idUsuario, id_edicao: edicao.id_edicao },
      }),
      this.prisma.atividadeMinistrante.count({
        where: {
          ministrante: { id_usuario: idUsuario },
          atividade: { id_edicao: edicao.id_edicao },
        },
      }),
    ]);

    const atividadesPorId = new Map<
      number,
      {
        id: string;
        titulo: string;
        inicio: Date | null;
        fim: Date | null;
        local?: string;
      }
    >();
    for (const inscricao of inscricoes) {
      for (const item of inscricao.inscricoesAtividades) {
        const { atividade } = item;
        const reserva = atividade.reservas[0];
        atividadesPorId.set(atividade.id_atividade, {
          id: String(atividade.id_atividade),
          titulo: atividade.titulo,
          inicio:
            atividade.data_abertura_atividade ?? reserva?.data_inicio ?? null,
          fim:
            atividade.data_encerramento_atividade ??
            reserva?.data_final ??
            null,
          local: reserva?.espaco?.nome_sala ?? undefined,
        });
      }
    }

    const atividades = [...atividadesPorId.values()]
      .map((a) => ({
        ...a,
        inicio: (a.inicio ?? edicao.data_abertura_evento)?.toISOString() ?? '',
        fim: (a.fim ?? edicao.data_encerramento_evento)?.toISOString() ?? '',
      }))
      .sort((a, b) => a.inicio.localeCompare(b.inicio));

    const confirmada = inscricoes.some((i) => i.status === 'Confirmada');

    return {
      slug: edicao.slug,
      idEdicao: edicao.id_edicao,
      nome: edicao.titulo_oficial,
      sigla: edicao.sigla ?? undefined,
      edicao: edicao.numero_edicao ?? undefined,
      descricao: edicao.descricao_geral ?? undefined,
      inicio: edicao.data_abertura_evento?.toISOString() ?? '',
      fim: edicao.data_encerramento_evento?.toISOString() ?? '',
      local: edicao.endereco ?? undefined,
      statusInscricao: confirmada ? 'confirmada' : 'pendente',
      papeis:
        comoMinistrante > 0
          ? ['participante', 'ministrante']
          : ['participante'],
      atividadesInscritas: atividades.length,
      certificadosDisponiveis: certificados,
      recibosDisponiveis: inscricoes
        .flatMap((i) => i.pagamentos)
        .filter((p) => Boolean(p.url_recibo)).length,
      // TrabalhoAcademico nao tem vinculo com a edicao no schema atual.
      submissoesEnviadas: 0,
      atividades,
    };
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
