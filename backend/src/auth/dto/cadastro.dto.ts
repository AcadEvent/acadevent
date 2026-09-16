import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CadastroDto {
  @ApiProperty({
    example: 'Nome Sobrenome',
    description: 'Nome completo do usuario',
  })
  @Transform(({ value }: { value: unknown }): string =>
    typeof value === 'string' ? value.trim() : '',
  )
  @IsString()
  @IsNotEmpty({ message: 'O nome nao pode ser vazio.' })
  nome: string;

  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'Email de acesso',
  })
  @Transform(({ value }: { value: unknown }): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : '',
  )
  @IsEmail({}, { message: 'Informe um email valido.' })
  email: string;

  @ApiProperty({
    example: 'senha1234',
    minLength: 6,
    description: 'Senha de acesso',
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no minimo 6 caracteres.' })
  senha: string;
}
