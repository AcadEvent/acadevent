import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AtualizarStatusDto {
  @ApiProperty({
    example: 'Publicado',
    enum: ['Rascunho', 'Publicado', 'Em andamento', 'Encerrado', 'Arquivado'],
    description: 'Novo status do evento',
  })
  @IsString()
  @IsNotEmpty({ message: 'O status e obrigatorio.' })
  @IsIn(
    [
      'Rascunho',
      'Publicado',
      'Em andamento',
      'Encerrado',
      'Arquivado',
      'Ativo',
    ],
    {
      message: 'Status do evento invalido.',
    },
  )
  status: string;
}
