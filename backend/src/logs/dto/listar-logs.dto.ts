import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListarLogsDto {
  @ApiPropertyOptional({
    description: 'Quantidade máxima de logs a retornar (entre 1 e 500)',
    default: 100,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite mínimo é 1' })
  @Max(500, { message: 'O limite máximo é 500' })
  limite?: number = 100;
}
