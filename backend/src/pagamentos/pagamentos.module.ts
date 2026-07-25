import { Module } from '@nestjs/common';
import { PagamentosController } from './pagamentos.controller';
import { InscricoesModule } from '../inscricoes/inscricoes.module';

@Module({
  imports: [InscricoesModule],
  controllers: [PagamentosController],
})
export class PagamentosModule {}
