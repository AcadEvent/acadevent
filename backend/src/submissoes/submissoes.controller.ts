import { Body, Controller, Post } from '@nestjs/common';
import { SubmissoesService } from './submissoes.service';
import { RegistrarAvaliacaoDto } from './dto/registrar-avaliacao.dto';

@Controller('submissoes')
export class SubmissoesController {
  constructor(private readonly submissoesService: SubmissoesService) {}

  @Post('avaliacoes')
  async registrarAvaliacao(@Body() dto: RegistrarAvaliacaoDto) {
    return this.submissoesService.registrarAvaliacao(dto);
  }
}
