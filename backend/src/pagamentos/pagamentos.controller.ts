import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { InscricoesService } from '../inscricoes/inscricoes.service';
import { PagamentosService } from './pagamentos.service';
import { WebhookPagamentoDto } from './dto/webhook-pagamento.dto';
import { ConfirmarPagamentoManualDto } from './dto/confirmar-pagamento-manual.dto';

@Controller('pagamentos')
export class PagamentosController {
  constructor(
    private readonly inscricoesService: InscricoesService,
    private readonly pagamentosService: PagamentosService,
  ) {}

  @Post('webhook')
  async webhook(@Body() dto: WebhookPagamentoDto) {
    return this.inscricoesService.processarWebhook(dto);
  }

  @Post('confirmar-manual')
  async confirmarManual(@Body() dto: ConfirmarPagamentoManualDto) {
    return this.pagamentosService.confirmarManual(dto);
  }

  @Get('relatorio/edicao/:id_edicao')
  async gerarRelatorioFinanceiro(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.pagamentosService.gerarRelatorioFinanceiro(idEdicao);
  }
}
