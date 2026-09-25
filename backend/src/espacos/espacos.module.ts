import { Module } from '@nestjs/common';
import { EspacosController } from './espacos.controller';
import { EspacosService } from './espacos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EspacosController],
  providers: [EspacosService],
  exports: [EspacosService],
})
export class EspacosModule {}
