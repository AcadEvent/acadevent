import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AtividadesService } from './atividades.service';
import { InscreverAtividadeDto } from './dto/inscrever-atividade.dto';
import { RegistrarPresencaItemDto } from './dto/registrar-presenca.dto';

interface RequestWithUser {
  user?: {
    id_usuario?: number;
    sub?: number;
  };
}

@Controller('atividades')
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

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
        'Identificador de usuário não fornecido no contexto de autenticação.',
      );
    }

    return this.atividadesService.inscrever(usuarioId, dto);
  }

  @Post('chamada')
  async chamada(@Body() itens: RegistrarPresencaItemDto[]) {
    return this.atividadesService.registrarChamada(itens);
  }
}
