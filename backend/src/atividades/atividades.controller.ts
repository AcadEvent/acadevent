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
} from '@nestjs/common';
import { AtividadesService } from './atividades.service';
import { InscreverAtividadeDto } from './dto/inscrever-atividade.dto';
import { RegistrarPresencaItemDto } from './dto/registrar-presenca.dto';
import { CriarAtividadeDto } from './dto/criar-atividade.dto';
import { AssociarMinistranteDto } from './dto/associar-ministrante.dto';

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
  async obterCronograma(
    @Param('id_edicao', ParseIntPipe) idEdicao: number,
  ) {
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

  @Post('chamada')
  async chamada(
    @Body() itens: RegistrarPresencaItemDto[],
    @Headers('x-usuario-id') usuarioIdHeader?: string,
    @Req() req?: RequestWithUser,
  ) {
    const rawId = usuarioIdHeader || req?.user?.id_usuario || req?.user?.sub;
    const usuarioId = rawId ? Number(rawId) : undefined;

    return this.atividadesService.registrarChamada(itens, usuarioId);
  }
}
