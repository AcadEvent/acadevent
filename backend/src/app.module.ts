import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AtividadesModule } from './atividades/atividades.module';
import { InscricoesModule } from './inscricoes/inscricoes.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';

@Module({
  imports: [PrismaModule, AtividadesModule, InscricoesModule, PagamentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
