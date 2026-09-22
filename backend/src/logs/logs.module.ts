import { Global, Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LoggingInterceptor } from './logging.interceptor';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [LogsController],
  providers: [LogsService, LoggingInterceptor],
  exports: [LogsService, LoggingInterceptor],
})
export class LogsModule {}
