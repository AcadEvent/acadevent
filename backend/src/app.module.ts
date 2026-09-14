import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AtividadesModule } from './atividades/atividades.module';
import { InscricoesModule } from './inscricoes/inscricoes.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { EspacosModule } from './espacos/espacos.module';
import { InventarioModule } from './inventario/inventario.module';
import { SubmissoesModule } from './submissoes/submissoes.module';
import { CertificadosModule } from './certificados/certificados.module';

@Module({
  imports: [
    PrismaModule,
    AtividadesModule,
    InscricoesModule,
    PagamentosModule,
    EspacosModule,
    InventarioModule,
    SubmissoesModule,
    CertificadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
