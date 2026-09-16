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
import { ComunicacaoService } from './comunicacao.service';
import { EnviarComunicadoDto } from './dto/enviar-comunicado.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('comunicacao')
@Controller('comunicacao')
export class ComunicacaoController {
  constructor(private readonly comunicacaoService: ComunicacaoService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar comunicado geral ou segmentado (RF09.2 / RF09.3)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post('enviar')
  enviarComunicado(@Body() dto: EnviarComunicadoDto) {
    return this.comunicacaoService.enviarComunicado(dto);
  }

  @ApiOperation({ summary: 'Listar comunicados de uma edicao' })
  @Get('edicao/:id')
  listarPorEdicao(@Param('id', ParseIntPipe) id: number) {
    return this.comunicacaoService.listarPorEdicao(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar notificacoes do usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  @Get('minhas-notificacoes')
  minhasNotificacoes(@CurrentUser() usuario: { id_usuario: number }) {
    return this.comunicacaoService.listarNotificacoesUsuario(
      usuario.id_usuario,
    );
  }
}
