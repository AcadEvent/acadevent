import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CriarItemInventarioDto } from './dto/criar-item-inventario.dto';
import { RetirarItemDto } from './dto/retirar-item.dto';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post('itens')
  async criarItem(@Body() dto: CriarItemInventarioDto) {
    return this.inventarioService.criarItem(dto);
  }

  @Get('itens/edicao/:id_edicao')
  async listarItensPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inventarioService.listarItensPorEdicao(idEdicao);
  }

  @Post('retirar')
  async retirarItem(@Body() dto: RetirarItemDto) {
    return this.inventarioService.retirarItem(dto);
  }

  @Patch('devolver/:id')
  async devolverItem(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.devolverItem(id);
  }

  @Get('alertas/edicao/:id_edicao')
  async obterAlertasEstoqueCritico(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inventarioService.obterAlertasEstoqueCritico(idEdicao);
  }

  @Get('relatorio/edicao/:id_edicao')
  async gerarRelatorioInventario(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inventarioService.gerarRelatorioInventario(idEdicao);
  }
}
