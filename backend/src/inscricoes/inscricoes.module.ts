import { Module } from '@nestjs/common';
import { InscricoesController } from './inscricoes.controller';
import { InscricoesService } from './inscricoes.service';

@Module({
  controllers: [InscricoesController],
  providers: [InscricoesService],
  exports: [InscricoesService],
})
export class InscricoesModule {}
