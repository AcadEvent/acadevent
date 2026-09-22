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
import { AtividadesService } from './atividades.service';
import { InscreverAtividadeDto } from './dto/inscrever-atividade.dto';
import {
  RegistrarPresencaDto,
  RegistrarPresencaItemDto,
} from './dto/registrar-presenca.dto';
import { CriarAtividadeDto } from './dto/criar-atividade.dto';
import { AssociarMinistranteDto } from './dto/associar-ministrante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  type UsuarioAutenticadoRequest,
} from '../auth/decorators/current-user.decorator';

@ApiTags('atividades')
@Controller('atividades')
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar atividade no evento (organizador/admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post()
  async criarAtividade(@Body() dto: CriarAtividadeDto) {
    return this.atividadesService.criarAtividade(dto);
  }

  @ApiOperation({ summary: 'Obter cronograma de atividades da edicao' })
  @Get('cronograma/edicao/:id_edicao')
  async obterCronograma(@Param('id_edicao', ParseIntPipe) idEdicao: number) {
    return this.atividadesService.obterCronogramaPorEdicao(idEdicao);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associar ministrante a atividade (organizador/admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'administrador')
  @Post('associar-ministrante')
  async associarMinistrante(@Body() dto: AssociarMinistranteDto) {
    return this.atividadesService.associarMinistrante(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscrever participante em atividade' })
  @UseGuards(JwtAuthGuard)
  @Post('inscrever')
  async inscrever(
    @Body() dto: InscreverAtividadeDto,
    @CurrentUser() usuario: UsuarioAutenticadoRequest,
  ) {
    if (!usuario?.id_usuario) {
      throw new UnauthorizedException(
        'Identificador de usuario nao fornecido no contexto de autenticacao.',
      );
    }

    return this.atividadesService.inscrever(usuario.id_usuario, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar chamada de presenca da atividade' })
  @UseGuards(JwtAuthGuard)
  @Post('chamada')
  async chamada(
    @CurrentUser() usuario: UsuarioAutenticadoRequest,
    @Body() body: RegistrarPresencaDto | RegistrarPresencaItemDto[],
  ) {
    if (!usuario?.id_usuario) {
      throw new UnauthorizedException(
        'Identificador de usuario nao fornecido no contexto de autenticacao.',
      );
    }
    const itens = Array.isArray(body) ? body : body?.presencas;

    return this.atividadesService.registrarChamada(itens, usuario.id_usuario);
  }
}
