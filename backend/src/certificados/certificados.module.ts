import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';

@Module({
  imports: [AuthModule],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [CertificadosService],
})
export class CertificadosModule {}
