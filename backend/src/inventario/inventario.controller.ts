import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventarioService } from './inventario.service';
import { CriarItemInventarioDto } from './dto/criar-item-inventario.dto';
import { RetirarItemDto } from './dto/retirar-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('inventario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('organizador', 'administrador')
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @ApiOperation({ summary: 'Criar item de inventário físico' })
  @Post('itens')
  async criarItem(@Body() dto: CriarItemInventarioDto) {
    return this.inventarioService.criarItem(dto);
  }

  @ApiOperation({ summary: 'Listar itens de inventário por edição' })
  @Get('itens/edicao/:id_edicao')
  async listarItensPorEdicao(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inventarioService.listarItensPorEdicao(idEdicao);
  }

  @ApiOperation({ summary: 'Retirar item de inventário' })
  @Post('retirar')
  async retirarItem(
    @Body() dto: RetirarItemDto,
    @CurrentUser() usuario: { id_usuario: number },
  ) {
    return this.inventarioService.retirarItem(dto, usuario.id_usuario);
  }

  @ApiOperation({ summary: 'Devolver item de inventário' })
  @Patch('devolver/:id')
  async devolverItem(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.devolverItem(id);
  }

  @ApiOperation({ summary: 'Obter alertas de estoque crítico' })
  @Get('alertas/edicao/:id_edicao')
  async obterAlertasEstoqueCritico(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inventarioService.obterAlertasEstoqueCritico(idEdicao);
  }

  @ApiOperation({ summary: 'Gerar relatório de inventário por edição' })
  @Get('relatorio/edicao/:id_edicao')
  async gerarRelatorioInventario(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
    return this.inventarioService.gerarRelatorioInventario(idEdicao);
  }
}
