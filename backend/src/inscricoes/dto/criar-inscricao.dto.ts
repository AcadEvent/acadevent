import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarInscricaoDto {
  @IsInt()
  @IsNotEmpty()
  id_lote: number;

  @IsString()
  @IsOptional()
  codigo_cupom?: string;
}
