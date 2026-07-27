import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CriarEspacoDto {
  @IsInt()
  id_edicao: number;

  @IsOptional()
  @IsString()
  tipo_espaco?: string;

  @IsOptional()
  @IsString()
  descricao_local?: string;

  @IsOptional()
  @IsString()
  instituicao?: string;

  @IsOptional()
  @IsString()
  nome_sala?: string;

  @IsInt()
  @Min(1)
  capacidade_max: number;

  @IsOptional()
  @IsString()
  descricao_recursos_disponiveis?: string;
}
