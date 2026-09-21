import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { timingSafeEqual } from 'crypto';
import { PagamentosService } from './pagamentos.service';
import { WebhookPagamentoDto } from './dto/webhook-pagamento.dto';
import { ConfirmarPagamentoManualDto } from './dto/confirmar-pagamento-manual.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

function segredosIguais(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

@ApiTags('pagamentos')
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @ApiOperation({ summary: 'Webhook de pagamentos externos' })
  @Post('webhook')
  async webhook(
    @Body() dto: WebhookPagamentoDto,
    @Headers('x-webhook-secret') secretHeader?: string,
    @Headers('x-signature') signatureHeader?: string,
  ) {
    const secret =
      secretHeader || signatureHeader || dto.secret || dto.assinatura;
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!expectedSecret || !secret || !segredosIguais(secret, expectedSecret)) {
      throw new UnauthorizedException(
        'Assinatura ou segredo do webhook ausente ou invalido.',
      );
    }

    return this.pagamentosService.processarWebhook(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar pagamento manual (Balcão)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post('confirmar-manual')
  async confirmarManual(@Body() dto: ConfirmarPagamentoManualDto) {
    return this.pagamentosService.confirmarManual(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar relatorio financeiro de uma edicao' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Get('relatorio/edicao/:id_edicao')
  async gerarRelatorioFinanceiro(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.pagamentosService.gerarRelatorioFinanceiro(idEdicao);
  }
}
