import { Module } from '@nestjs/common';
import { ComunicacaoController } from './comunicacao.controller';
import { ComunicacaoService } from './comunicacao.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ComunicacaoController],
  providers: [ComunicacaoService],
  exports: [ComunicacaoService],
})
export class ComunicacaoModule {}
