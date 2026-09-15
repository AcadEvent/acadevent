import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  email: string;
  nome: string;
  perfis: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'acadevent_jwt_secret_key_sbe_p3',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id_usuario: payload.sub,
      email: payload.email,
      nome: payload.nome,
      perfis: payload.perfis,
    };
  }
}
