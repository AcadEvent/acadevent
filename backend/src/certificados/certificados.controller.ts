import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CertificadosService } from './certificados.service';
import { EmitirCertificadoAtividadeDto } from './dto/emitir-certificado-atividade.dto';

@ApiTags('certificados')
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @ApiOperation({ summary: 'Emitir certificado de atividade (RF11.1)' })
  @Post('atividade')
  async emitirCertificadoAtividade(@Body() dto: EmitirCertificadoAtividadeDto) {
    return this.certificadosService.emitirCertificadoAtividade(dto);
  }

  @ApiOperation({ summary: 'Validar autenticidade do certificado publicamente (RF11.7)' })
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
    const pdfBuffer = await this.certificadosService.gerarPdfCertificado(codigo);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${codigo}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
