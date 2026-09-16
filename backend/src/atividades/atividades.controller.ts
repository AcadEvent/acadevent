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
import { AtividadesService } from './atividades.service';
import { InscreverAtividadeDto } from './dto/inscrever-atividade.dto';
import {
  RegistrarPresencaDto,
  RegistrarPresencaItemDto,
} from './dto/registrar-presenca.dto';
import { CriarAtividadeDto } from './dto/criar-atividade.dto';
import { AssociarMinistranteDto } from './dto/associar-ministrante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface RequestWithUser {
  user?: {
    id_usuario?: number;
    sub?: number;
  };
}

@Controller('atividades')
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  @Post()
  async criarAtividade(@Body() dto: CriarAtividadeDto) {
    return this.atividadesService.criarAtividade(dto);
  }

  @Get('cronograma/edicao/:id_edicao')
  async obterCronograma(@Param('id_edicao', ParseIntPipe) idEdicao: number) {
    return this.atividadesService.obterCronogramaPorEdicao(idEdicao);
  }

  @Post('associar-ministrante')
  async associarMinistrante(@Body() dto: AssociarMinistranteDto) {
    return this.atividadesService.associarMinistrante(dto);
  }

  @Post('inscrever')
  async inscrever(
    @Body() dto: InscreverAtividadeDto,
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

    return this.atividadesService.inscrever(usuarioId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chamada')
  async chamada(
    @CurrentUser() usuario: { id_usuario: number },
    @Body() body: RegistrarPresencaDto | RegistrarPresencaItemDto[],
    @Headers('x-usuario-id') usuarioIdHeader?: string,
    @Req() req?: RequestWithUser,
  ) {
    const rawId =
      usuario?.id_usuario ||
      usuarioIdHeader ||
      req?.user?.id_usuario ||
      req?.user?.sub;
    const usuarioId = rawId ? Number(rawId) : undefined;
    const itens = Array.isArray(body) ? body : body?.presencas;

    return this.atividadesService.registrarChamada(itens, usuarioId);
  }
}
