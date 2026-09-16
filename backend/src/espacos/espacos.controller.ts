import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EspacosService } from './espacos.service';
import { CriarEspacoDto } from './dto/criar-espaco.dto';
import { ReservarEspacoDto } from './dto/reservar-espaco.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('espacos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('espacos')
export class EspacosController {
  constructor(private readonly espacosService: EspacosService) {}

  @ApiOperation({ summary: 'Criar novo espaço físico para a edição' })
  @Post()
  async criarEspaco(@Body() dto: CriarEspacoDto) {
    return this.espacosService.criarEspaco(dto);
  }

  @ApiOperation({ summary: 'Listar espaços físicos de uma edição' })
  @Get('edicao/:id_edicao')
  async listarEspacosPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.espacosService.listarEspacosPorEdicao(idEdicao);
  }

  @ApiOperation({ summary: 'Reservar espaço físico para uma atividade' })
  @Post('reservar')
  async reservarEspaco(@Body() dto: ReservarEspacoDto) {
    return this.espacosService.reservarEspaco(dto);
  }

  @ApiOperation({ summary: 'Obter mapa de ocupação dos espaços da edição' })
  @Get('mapa-ocupacao/edicao/:id_edicao')
  async obterMapaOcupacao(@Param('id_edicao', ParseIntPipe) idEdicao: number) {
    return this.espacosService.obterMapaOcupacao(idEdicao);
  }
}
