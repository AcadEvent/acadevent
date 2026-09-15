import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Cadastrar novo usuario na plataforma (RF02.1.1)' })
  @Post('cadastro')
  cadastrar(@Body() dto: CadastroDto) {
    return this.authService.cadastrar(dto);
  }

  @ApiOperation({ summary: 'Login com email e senha gerando JWT (RF02.1.1 / RNF03.1)' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar dados do usuario autenticado atual' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  obterPerfil(@CurrentUser() usuario: { id_usuario: number }) {
    return this.authService.obterPerfilAtual(usuario.id_usuario);
  }
}
