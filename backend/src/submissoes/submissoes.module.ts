import { Module } from '@nestjs/common';
import { SubmissoesController } from './submissoes.controller';
import { SubmissoesService } from './submissoes.service';

@Module({
  controllers: [SubmissoesController],
  providers: [SubmissoesService],
  exports: [SubmissoesService],
})
export class SubmissoesModule {}
