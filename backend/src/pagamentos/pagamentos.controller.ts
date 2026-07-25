import { Body, Controller, Post } from '@nestjs/common';
import { InscricoesService } from '../inscricoes/inscricoes.service';
import { WebhookPagamentoDto } from './dto/webhook-pagamento.dto';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly inscricoesService: InscricoesService) {}

  @Post('webhook')
  async webhook(@Body() dto: WebhookPagamentoDto) {
    return this.inscricoesService.processarWebhook(dto);
  }
}
