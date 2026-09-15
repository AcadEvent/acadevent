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

    // Envio assincrono de e-mails / notificacoes em lote
    this.processarEnvioAssincrono(comunicado.id_comunicado, dto);

    return comunicado;
  }

  private async processarEnvioAssincrono(
    idComunicado: number,
    dto: EnviarComunicadoDto,
  ) {
    try {
      const inscricoes = await this.prisma.inscricaoEdicao.findMany({
        where: {
          lote: { id_edicao: dto.id_edicao },
          status: { not: 'Cancelada' },
        },
        include: {
          participante: {
            include: { usuario: true },
          },
        },
      });

      for (const inscricao of inscricoes) {
        const usuario = inscricao.participante?.usuario;
        if (usuario) {
          await this.prisma.notificacao.create({
            data: {
              id_usuario: usuario.id_usuario,
              titulo: dto.titulo,
              mensagem: dto.conteudo,
            },
          });

          this.logger.log(
            `E-mail transacional disparado para: ${usuario.email} | Assunto: ${dto.titulo}`,
          );
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
