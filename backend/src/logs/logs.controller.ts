import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar logs assincronos de auditoria (RF16.3)' })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @Get()
  listarLogs(@Query('limite') limite?: string) {
    const lim = limite ? parseInt(limite, 10) : 100;
    return this.logsService.listarRecentes(lim);
  }
}
