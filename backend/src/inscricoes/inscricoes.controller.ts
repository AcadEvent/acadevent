import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { InscricoesService } from './inscricoes.service';
import { CriarInscricaoDto } from './dto/criar-inscricao.dto';

interface RequestWithUser {
  user?: {
    id_usuario?: number;
    sub?: number;
  };
}

@Controller('inscricoes')
export class InscricoesController {
  constructor(private readonly inscricoesService: InscricoesService) {}

  @Post()
  async criar(
    @Body() dto: CriarInscricaoDto,
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

    return this.inscricoesService.criarInscricao(usuarioId, dto);
  }
}
