import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async cadastrar(dto: CadastroDto) {
    const emailNormalizado = dto.email.trim().toLowerCase();

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      throw new BadRequestException('Este email ja esta cadastrado no sistema.');
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(dto.senha, saltRounds);

    const novoUsuario = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome: dto.nome.trim(),
          email: emailNormalizado,
          senha_hash: senhaHash,
        },
      });

      await tx.perfilParticipante.create({
        data: {
          id_usuario: usuario.id_usuario,
        },
      });

      await tx.perfilUsuario.create({
        data: {
          id_usuario: usuario.id_usuario,
          tipo_perfil: 'participante',
        },
      });

      return usuario;
    });

    const perfis = ['participante'];
    const payload = {
      sub: novoUsuario.id_usuario,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      perfis,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      usuario: {
        id_usuario: novoUsuario.id_usuario,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfis,
      },
    };
  }

  async login(dto: LoginDto) {
    const emailNormalizado = dto.email.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      include: {
        perfis: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    const perfis =
      usuario.perfis && usuario.perfis.length > 0
        ? usuario.perfis.map((p) => p.tipo_perfil.toLowerCase())
        : ['participante'];

    const payload = {
      sub: usuario.id_usuario,
      email: usuario.email,
      nome: usuario.nome,
      perfis,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfis,
      },
    };
  }

  async obterPerfilAtual(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
      include: {
        perfis: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    const perfis =
      usuario.perfis && usuario.perfis.length > 0
        ? usuario.perfis.map((p) => p.tipo_perfil.toLowerCase())
        : ['participante'];

    return {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      url_foto: usuario.url_foto,
      perfis,
    };
  }
}
