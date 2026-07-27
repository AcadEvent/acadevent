import { IsInt, IsOptional, Min } from 'class-validator';

export class RetirarItemDto {
  @IsInt()
  id_item: number;

  @IsInt()
  id_organizador: number;

  @IsOptional()
  @IsInt()
  id_ministrante?: number;

  @IsInt()
  @Min(1)
  quantidade_retirada: number;
}
