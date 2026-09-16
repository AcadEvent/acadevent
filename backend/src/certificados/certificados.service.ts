import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { spEmitirCertificadoAtividade } from '../prisma/procedures';
import { EmitirCertificadoAtividadeDto } from './dto/emitir-certificado-atividade.dto';

@Injectable()
export class CertificadosService {
  constructor(private readonly prisma: PrismaService) {}

  private mascararEmail(email: string): string {
    const [local, dominio] = email.split('@');
    if (!dominio) return '***';
    if (local.length <= 2) {
      return `${local[0]}***@${dominio}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${dominio}`;
  }

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

    const certificadoExistente = await this.prisma.certificado.findFirst({
      where: {
        id_usuario: dto.id_usuario,
        id_atividade: dto.id_atividade,
      },
    });

    if (certificadoExistente) {
      throw new ConflictException(
        'Certificado ja emitido para este usuario nesta atividade.',
      );
    }

    const codigoAutenticidade = `AUTH-${randomUUID()}`;

    return this.prisma.$transaction(async (tx) =>
      spEmitirCertificadoAtividade(tx, {
        id_edicao: dto.id_edicao,
        id_atividade: dto.id_atividade,
        id_usuario: dto.id_usuario,
        codigo_autenticidade: codigoAutenticidade,
      }),
    );
  }

  async validarCertificado(codigoAutenticidade: string) {
    const cert = await this.prisma.certificado.findUnique({
      where: { codigo_autenticidade: codigoAutenticidade },
      include: {
        usuario: {
          select: { id_usuario: true, nome: true, email: true },
        },
        edicao: {
          select: { id_edicao: true, titulo_oficial: true, sigla: true },
        },
        atividade: {
          select: { id_atividade: true, titulo: true, carga_horario: true },
        },
      },
    });

    if (!cert) {
      throw new NotFoundException(
        `Certificado com codigo '${codigoAutenticidade}' nao encontrado ou invalido.`,
      );
    }

    return {
      valido: true,
      certificado: {
        ...cert,
        usuario: cert.usuario
          ? {
              ...cert.usuario,
              email: cert.usuario.email
                ? this.mascararEmail(cert.usuario.email)
                : cert.usuario.email,
            }
          : cert.usuario,
      },
    };
  }

  async gerarPdfCertificado(codigoAutenticidade: string): Promise<Buffer> {
    const validacao = await this.validarCertificado(codigoAutenticidade);
    const cert = validacao.certificado;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 40,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Borda decorativa institucional
      doc.rect(20, 20, 802, 555).lineWidth(4).strokeColor('#1976d2').stroke();

      doc.rect(26, 26, 790, 543).lineWidth(1).strokeColor('#90caf9').stroke();

      doc.moveDown(2);

      // Cabecalho
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#0d47a1')
        .text('ACADEVENT', { align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#555555')
        .text('SISTEMA DE GESTAO DE EVENTOS ACADEMICOS', { align: 'center' });

      doc.moveDown(2);

      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor('#1b5e20')
        .text('CERTIFICADO DE PARTICIPACAO', { align: 'center' });

      doc.moveDown(2);

      // Corpo do Certificado
      const nomeParticipante = cert.usuario.nome.toUpperCase();
      const nomeAtividade =
        cert.nome_atividade || cert.atividade?.titulo || 'Atividade Academica';
      const nomeEvento = cert.edicao.titulo_oficial;
      const cargaHoraria =
        (cert.atividade?.carga_horario != null
          ? String(cert.atividade.carga_horario)
          : null) ||
        cert.carga_horaria_impressa ||
        '4';

      doc
        .font('Helvetica')
        .fontSize(16)
        .fillColor('#222222')
        .text(
          `Certificamos que ${nomeParticipante} participou com exito da atividade "${nomeAtividade}", realizada no ambito do evento "${nomeEvento}", cumprindo carga horaria total de ${cargaHoraria} horas.`,
          {
            align: 'center',
            lineGap: 6,
          },
        );

      doc.moveDown(4);

      // Rodape com codigo de autenticidade
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#333333')
        .text(`Codigo de Autenticidade: ${cert.codigo_autenticidade}`, {
          align: 'center',
        });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#777777')
        .text(
          `Valide este certificado em: ${frontendUrl}/validar/${cert.codigo_autenticidade}`,
          { align: 'center' },
        );

      doc.end();
    });
  }
}
