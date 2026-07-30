import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CriarLoteDto {
  @IsInt()
  id_edicao: number;

  @IsString()
  nome_lote: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  data_abertura_lote?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  data_encerramento_lote?: Date;

  @IsNumber()
  @Min(0)
  preco: number;

  @IsInt()
  @Min(1)
  numero_max_ingressos: number;
}
