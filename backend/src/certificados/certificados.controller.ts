import { Body, Controller, Post } from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { EmitirCertificadoAtividadeDto } from './dto/emitir-certificado-atividade.dto';

@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post('atividade')
  async emitirCertificadoAtividade(@Body() dto: EmitirCertificadoAtividadeDto) {
    return this.certificadosService.emitirCertificadoAtividade(dto);
  }
}
