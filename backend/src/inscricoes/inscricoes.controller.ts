import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InscricoesService } from './inscricoes.service';
import { CriarInscricaoDto } from './dto/criar-inscricao.dto';
import { CriarLoteDto } from './dto/criar-lote.dto';
import { CriarCupomDto } from './dto/criar-cupom.dto';
import { ValidarQrCodeDto } from './dto/validar-qrcode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  type UsuarioAutenticadoRequest,
} from '../auth/decorators/current-user.decorator';

@ApiTags('inscricoes')
@Controller('inscricoes')
export class InscricoesController {
  constructor(private readonly inscricoesService: InscricoesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar inscricao em evento (participante)' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async criar(
    @Body() dto: CriarInscricaoDto,
    @CurrentUser() usuario: UsuarioAutenticadoRequest,
  ) {
    if (!usuario?.id_usuario) {
      throw new UnauthorizedException(
        'Identificador de usuario nao fornecido no contexto de autenticacao.',
      );
    }

    return this.inscricoesService.criarInscricao(usuario.id_usuario, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar lote de ingressos (organizador/admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post('lotes')
  async criarLote(@Body() dto: CriarLoteDto) {
    return this.inscricoesService.criarLote(dto);
  }

  @ApiOperation({ summary: 'Listar lotes de uma edicao' })
  @Get('lotes/edicao/:id_edicao')
  async listarLotesPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inscricoesService.listarLotesPorEdicao(idEdicao);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar cupom de desconto (organizador/admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post('cupons')
  async criarCupom(@Body() dto: CriarCupomDto) {
    return this.inscricoesService.criarCupom(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar cupons de uma edicao (organizador/admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Get('cupons/edicao/:id_edicao')
  async listarCuponsPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inscricoesService.listarCuponsPorEdicao(idEdicao);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar QR Code de check-in (organizador/admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post('validar-qrcode')
  async validarQrCode(@Body() dto: ValidarQrCodeDto) {
    return this.inscricoesService.validarQrCode(dto.url_qrcode);
  }
}
