import { Module } from '@nestjs/common';
import { EspacosController } from './espacos.controller';
import { EspacosService } from './espacos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EspacosController],
  providers: [EspacosService],
  exports: [EspacosService],
})
export class EspacosModule {}
