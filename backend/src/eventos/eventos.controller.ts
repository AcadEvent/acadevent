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
import { EventosService } from './eventos.service';
import { CriarEventoDto } from './dto/criar-evento.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @ApiOperation({ summary: 'Listar eventos públicos publicados (RF01.5 / RF14)' })
  @Get()
  listarPublicos() {
    return this.eventosService.listarPublicos();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar eventos gerenciados pelo organizador autenticado' })
  @UseGuards(JwtAuthGuard)
  @Get('gerenciar/meus')
  listarMeusEventos(@CurrentUser() usuario: { id_usuario: number }) {
    return this.eventosService.listarPorOrganizador(usuario.id_usuario);
  }

  @ApiOperation({ summary: 'Buscar detalhes do evento pelo slug ou id (RF01.5)' })
  @Get(':slug')
  buscarPorSlug(@Param('slug') slug: string) {
    return this.eventosService.buscarPorSlug(slug);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo evento e sua edicao inicial (RF01.1)' })
  @UseGuards(JwtAuthGuard)
  @Post()
  criarEvento(
    @CurrentUser() usuario: { id_usuario: number },
    @Body() dto: CriarEventoDto,
  ) {
    return this.eventosService.criarEvento(usuario.id_usuario, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status do evento (RF01.3.3)' })
  @UseGuards(JwtAuthGuard)
  @Patch('edicoes/:id/status')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarStatusDto,
  ) {
    return this.eventosService.atualizarStatus(id, dto);
  }
}
