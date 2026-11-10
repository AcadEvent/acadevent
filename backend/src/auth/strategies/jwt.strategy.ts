import { Injectable, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  email: string;
  nome: string;
  perfis: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Optional() private readonly prisma?: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET nao definido no ambiente.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id_usuario: payload.sub,
      email: payload.email,
      nome: payload.nome,
      perfis: await this.perfisVigentes(payload),
    };
  }

  /**
   * Perfis atuais do usuario no banco. O JWT guarda os perfis do momento do
   * login, entao quem ganha um perfil depois (ex.: `organizador` ao criar um
   * evento) tomaria 403 "Forbidden resource" ate entrar de novo. Sem registros
   * no banco (ou sem acesso a ele) vale o que esta no token.
   */
  private async perfisVigentes(payload: JwtPayload): Promise<string[]> {
    if (!this.prisma) {
      return payload.perfis;
    }

    const registros = await this.prisma.perfilUsuario.findMany({
      where: { id_usuario: payload.sub },
      select: { tipo_perfil: true },
    });

    return registros.length > 0
      ? registros.map((r) => r.tipo_perfil.toLowerCase())
      : payload.perfis;
  }
}
