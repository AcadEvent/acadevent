import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CriarItemInventarioDto {
  @IsInt()
  id_edicao: number;

  @IsOptional()
  @IsString()
  tipo_item?: string;

  @IsInt()
  @Min(1)
  quantidade_total: number;

  @IsInt()
  @Min(0)
  quantidade_minima: number;

  @IsOptional()
  @IsString()
  descricao?: string;
}
