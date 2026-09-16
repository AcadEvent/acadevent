import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnviarComunicadoDto {
  @ApiProperty({ example: 1, description: 'ID da edicao do evento' })
  @IsInt()
  @IsNotEmpty({ message: 'O id_edicao e obrigatorio.' })
  id_edicao: number;

  @ApiPropertyOptional({ example: 10, description: 'ID da atividade opcional' })
  @IsInt()
  @IsOptional()
  id_atividade?: number;

  @ApiProperty({
    example: 'Mudanca de Sala - Palestra Magna',
    description: 'Titulo do comunicado',
  })
  @IsString()
  @IsNotEmpty({ message: 'O titulo e obrigatorio.' })
  titulo: string;

  @ApiProperty({
    example: 'Informamos que a palestra ocorrera no Auditorio B.',
    description: 'Conteudo do comunicado',
  })
  @IsString()
  @IsNotEmpty({ message: 'O conteudo e obrigatorio.' })
  conteudo: string;

  @ApiPropertyOptional({
    example: 'participante',
    description: 'Segmentacao por perfil ou todos',
  })
  @IsString()
  @IsOptional()
  perfil_alvo?: string;
}
