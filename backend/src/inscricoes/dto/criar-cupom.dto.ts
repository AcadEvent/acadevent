import { IsInt, IsString, Max, Min } from 'class-validator';

export class CriarCupomDto {
  @IsInt()
  id_edicao: number;

  @IsString()
  codigo: string;

  @IsInt()
  @Min(1)
  @Max(100)
  percentual_desconto: number;

  @IsInt()
  @Min(1)
  limite_usos: number;
}
