import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UsuarioAutenticadoRequest } from '../auth/decorators/current-user.decorator';
import { CertificadosService } from './certificados.service';
import { EmitirCertificadoAtividadeDto } from './dto/emitir-certificado-atividade.dto';

@ApiTags('certificados')
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Emitir certificado de atividade (RF11.1)' })
  @Post('atividade')
  async emitirCertificadoAtividade(
    @Body() dto: EmitirCertificadoAtividadeDto,
    @CurrentUser() usuario: UsuarioAutenticadoRequest,
  ) {
    const perfis = (usuario.perfis ?? []).map((p) => p.toLowerCase());
    const podeEmitirParaOutros =
      perfis.includes('organizador') || perfis.includes('administrador');
    const idUsuario = dto.id_usuario ?? usuario.id_usuario;

    if (idUsuario !== usuario.id_usuario && !podeEmitirParaOutros) {
      throw new ForbiddenException(
        'Apenas organizadores ou administradores podem emitir certificado para outro usuario.',
      );
    }

    return this.certificadosService.emitirCertificadoAtividade({
      ...dto,
      id_usuario: idUsuario,
    });
  }

  @ApiOperation({
    summary: 'Validar autenticidade do certificado publicamente (RF11.7)',
  })
  @Get(':codigo/validar')
  async validarCertificado(@Param('codigo') codigo: string) {
    return this.certificadosService.validarCertificado(codigo);
  }

  @ApiOperation({ summary: 'Download do certificado gerado em PDF (RF11.5)' })
  @Get(':codigo/download')
  async downloadCertificado(
    @Param('codigo') codigo: string,
    @Res() res: Response,
  ) {
    const pdfBuffer =
      await this.certificadosService.gerarPdfCertificado(codigo);

    const sanitizedCodigo =
      codigo.replace(/[^a-zA-Z0-9_-]/g, '') || 'documento';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${sanitizedCodigo}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
