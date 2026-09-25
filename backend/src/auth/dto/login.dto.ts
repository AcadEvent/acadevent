import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'Email de acesso',
  })
  @IsEmail({}, { message: 'Informe um email valido.' })
  email: string;

  @ApiProperty({
    example: 'senha1234',
    minLength: 6,
    description: 'Senha de acesso',
  })
  @IsString()
  @IsNotEmpty({ message: 'A senha e obrigatoria.' })
  @MinLength(6, { message: 'A senha deve ter no minimo 6 caracteres.' })
  senha: string;
}
