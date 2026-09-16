import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CriarEventoDto {
  @ApiProperty({
    example: 'Semana de Computacao 2026',
    description: 'Nome da marca do evento',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome da marca do evento e obrigatorio.' })
  nome_marca: string;

  @ApiProperty({
    example: 'I Semana de Ciencia da Computacao e Informatica',
    description: 'Titulo oficial da edicao',
  })
  @IsString()
  @IsNotEmpty({ message: 'O titulo oficial da edicao e obrigatorio.' })
  titulo_oficial: string;

  @ApiProperty({
    example: 'secint2026',
    description: 'Sigla ou slug identificador',
  })
  @IsString()
  @IsNotEmpty({ message: 'A sigla e obrigatoria.' })
  sigla: string;

  @ApiProperty({
    example: 'Faculdade de Computacao - FACOM',
    description: 'Unidade promotora',
  })
  @IsString()
  @IsNotEmpty({ message: 'A unidade promotora e obrigatoria.' })
  unidade_promotora: string;

  @ApiPropertyOptional({
    example: 'Inteligencia Artificial e Engenharia de Software',
  })
  @IsString()
  @IsOptional()
  area_tematica?: string;

  @ApiPropertyOptional({
    example: 'Evento voltado a estudantes e profissionais de TI',
  })
  @IsString()
  @IsOptional()
  descricao_geral?: string;

  @ApiProperty({
    example: '2026-10-10T08:00:00.000Z',
    description: 'Data e hora de inicio',
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de abertura do evento invalida.' })
  data_abertura_evento: Date;

  @ApiProperty({
    example: '2026-10-15T18:00:00.000Z',
    description: 'Data e hora de encerramento',
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de encerramento do evento invalida.' })
  data_encerramento_evento: Date;

  @ApiPropertyOptional({
    example: 300,
    description: 'Capacidade maxima de participantes',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacidade_max_participantes?: number;

  @ApiPropertyOptional({ example: 'Auditório Central, Campus Universitario' })
  @IsString()
  @IsOptional()
  endereco?: string;
}
