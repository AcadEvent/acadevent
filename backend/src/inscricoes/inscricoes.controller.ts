import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InscricoesService } from './inscricoes.service';
import { CriarInscricaoDto } from './dto/criar-inscricao.dto';
import { CriarLoteDto } from './dto/criar-lote.dto';
import { CriarCupomDto } from './dto/criar-cupom.dto';
import { ValidarQrCodeDto } from './dto/validar-qrcode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface RequestWithUser {
  user?: {
    id_usuario?: number;
    sub?: number;
  };
}

@Controller('inscricoes')
export class InscricoesController {
  constructor(private readonly inscricoesService: InscricoesService) {}

  @Post()
  async criar(
    @Body() dto: CriarInscricaoDto,
    @Headers('x-usuario-id') usuarioIdHeader?: string,
    @Req() req?: RequestWithUser,
  ) {
    const rawId = usuarioIdHeader || req?.user?.id_usuario || req?.user?.sub;
    const usuarioId = Number(rawId);

    if (!usuarioId || Number.isNaN(usuarioId)) {
      throw new UnauthorizedException(
        'Identificador de usuario nao fornecido no contexto de autenticacao.',
      );
    }

    return this.inscricoesService.criarInscricao(usuarioId, dto);
  }

  @Post('lotes')
  async criarLote(@Body() dto: CriarLoteDto) {
    return this.inscricoesService.criarLote(dto);
  }

  @Get('lotes/edicao/:id_edicao')
  async listarLotesPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inscricoesService.listarLotesPorEdicao(idEdicao);
  }

  @Post('cupons')
  async criarCupom(@Body() dto: CriarCupomDto) {
    return this.inscricoesService.criarCupom(dto);
  }

  @Get('cupons/edicao/:id_edicao')
  async listarCuponsPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inscricoesService.listarCuponsPorEdicao(idEdicao);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post('validar-qrcode')
  async validarQrCode(@Body() dto: ValidarQrCodeDto) {
    return this.inscricoesService.validarQrCode(dto.url_qrcode);
  }
}
