import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EspacosService } from './espacos.service';
import { CriarEspacoDto } from './dto/criar-espaco.dto';
import { ReservarEspacoDto } from './dto/reservar-espaco.dto';

@Controller('espacos')
export class EspacosController {
  constructor(private readonly espacosService: EspacosService) {}

  @Post()
  async criarEspaco(@Body() dto: CriarEspacoDto) {
    return this.espacosService.criarEspaco(dto);
  }

  @Get('edicao/:id_edicao')
  async listarEspacosPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.espacosService.listarEspacosPorEdicao(idEdicao);
  }

  @Post('reservar')
  async reservarEspaco(@Body() dto: ReservarEspacoDto) {
    return this.espacosService.reservarEspaco(dto);
  }

  @Get('mapa-ocupacao/edicao/:id_edicao')
  async obterMapaOcupacao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.espacosService.obterMapaOcupacao(idEdicao);
  }
}
