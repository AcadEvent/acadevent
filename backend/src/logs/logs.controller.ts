import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ListarLogsDto } from './dto/listar-logs.dto';

@ApiTags('admin')
@Controller('admin/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar logs assincronos de auditoria (RF16.3)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @Get()
  listarLogs(@Query() query: ListarLogsDto) {
    const lim =
      typeof query?.limite === 'number' && !Number.isNaN(query.limite)
        ? Math.max(1, Math.min(query.limite, 500))
        : 100;
    return this.logsService.listarRecentes(lim);
  }
}
