import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnviarComunicadoDto } from './dto/enviar-comunicado.dto';

@Injectable()
export class ComunicacaoService {
  private readonly logger = new Logger(ComunicacaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enviarComunicado(dto: EnviarComunicadoDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: dto.id_edicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    const comunicado = await this.prisma.comunicado.create({
      data: {
        id_edicao: dto.id_edicao,
        id_atividade: dto.id_atividade,
        titulo: dto.titulo,
        conteudo: dto.conteudo,
        perfil_alvo: dto.perfil_alvo || 'todos',
      },
    });

    // Envio de e-mails / notificacoes em lote
    await this.processarEnvioAssincrono(comunicado.id_comunicado, dto);

    return comunicado;
  }

  private async processarEnvioAssincrono(
    idComunicado: number,
    dto: EnviarComunicadoDto,
  ) {
    try {
      const whereClause: Record<string, any> = {
        lote: { id_edicao: dto.id_edicao },
        status: { not: 'Cancelada' },
      };

      if (dto.id_atividade) {
        whereClause.inscricoesAtividades = {
          some: { id_atividade: dto.id_atividade },
        };
      }

      if (dto.perfil_alvo && dto.perfil_alvo.toLowerCase() !== 'todos') {
        whereClause.participante = {
          usuario: {
            perfis: {
              some: {
                tipo_perfil: {
                  equals: dto.perfil_alvo,
                  mode: 'insensitive',
                },
              },
            },
          },
        };
      }

      const inscricoes = await this.prisma.inscricaoEdicao.findMany({
        where: whereClause,
        include: {
          participante: {
            include: { usuario: true },
          },
        },
      });

      const idsUsuarios = Array.from(
        new Set(
          inscricoes
            .map((i) => i.participante?.usuario?.id_usuario)
            .filter((id): id is number => typeof id === 'number'),
        ),
      );

      if (idsUsuarios.length > 0) {
        await this.prisma.notificacao.createMany({
          data: idsUsuarios.map((id_usuario) => ({
            id_usuario,
            titulo: dto.titulo,
            mensagem: dto.conteudo,
          })),
        });

        for (const inscricao of inscricoes) {
          const usuario = inscricao.participante?.usuario;
          if (usuario?.email) {
            this.logger.log(
              `E-mail transacional disparado para: ${usuario.email} | Assunto: ${dto.titulo}`,
            );
          }
        }
      }
    } catch (err) {
      this.logger.error(
        `Erro ao processar notificacoes em lote para comunicado ${idComunicado}:`,
        err,
      );
    }
  }

  async listarPorEdicao(idEdicao: number) {
    return this.prisma.comunicado.findMany({
      where: { id_edicao: idEdicao },
      orderBy: { data_envio: 'desc' },
    });
  }

  async listarNotificacoesUsuario(idUsuario: number) {
    return this.prisma.notificacao.findMany({
      where: { id_usuario: idUsuario },
      orderBy: { data: 'desc' },
      take: 50,
    });
  }
}
