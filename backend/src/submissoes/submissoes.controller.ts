import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubmissoesService } from './submissoes.service';
import { RegistrarAvaliacaoDto } from './dto/registrar-avaliacao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('submissoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('parecerista')
@Controller('submissoes')
export class SubmissoesController {
  constructor(private readonly submissoesService: SubmissoesService) {}

  @ApiOperation({ summary: 'Registrar avaliação de trabalho acadêmico' })
  @Post('avaliacoes')
  async registrarAvaliacao(
    @Body() dto: RegistrarAvaliacaoDto,
    @CurrentUser() usuario: { id_usuario: number },
  ) {
    return this.submissoesService.registrarAvaliacao(dto, usuario.id_usuario);
  }
}
