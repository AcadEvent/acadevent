import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class RegistrarAvaliacaoDto {
  @IsInt()
  id_parecerista: number;

  @IsInt()
  id_trabalho: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  parecer: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  nota: number;
}
