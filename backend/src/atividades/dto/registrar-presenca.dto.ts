import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegistrarPresencaItemDto {
  @IsInt()
  @IsNotEmpty()
  id_inscricao_atividade: number;

  @IsIn(['Presente', 'Ausente'])
  @IsNotEmpty()
  status: string;
}

export class RegistrarPresencaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrarPresencaItemDto)
  presencas: RegistrarPresencaItemDto[];
}
