import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventosModule } from './eventos/eventos.module';
import { AtividadesModule } from './atividades/atividades.module';
import { InscricoesModule } from './inscricoes/inscricoes.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { EspacosModule } from './espacos/espacos.module';
import { InventarioModule } from './inventario/inventario.module';
import { SubmissoesModule } from './submissoes/submissoes.module';
import { CertificadosModule } from './certificados/certificados.module';
import { StorageModule } from './storage/storage.module';
import { ComunicacaoModule } from './comunicacao/comunicacao.module';
import { LogsModule } from './logs/logs.module';
import { LoggingInterceptor } from './logs/logging.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EventosModule,
    AtividadesModule,
    InscricoesModule,
    PagamentosModule,
    EspacosModule,
    InventarioModule,
    SubmissoesModule,
    CertificadosModule,
    StorageModule,
    ComunicacaoModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
