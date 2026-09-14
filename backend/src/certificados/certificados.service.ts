import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spEmitirCertificadoAtividade } from '../prisma/procedures';
import { EmitirCertificadoAtividadeDto } from './dto/emitir-certificado-atividade.dto';

@Injectable()
export class CertificadosService {
  constructor(private readonly prisma: PrismaService) {}

  async emitirCertificadoAtividade(dto: EmitirCertificadoAtividadeDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: dto.id_edicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: dto.id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return this.prisma.$transaction(async (tx) =>
      spEmitirCertificadoAtividade(tx, {
        id_edicao: dto.id_edicao,
        id_atividade: dto.id_atividade,
        id_usuario: dto.id_usuario,
        codigo_autenticidade: dto.codigo_autenticidade,
      }),
    );
  }
}
