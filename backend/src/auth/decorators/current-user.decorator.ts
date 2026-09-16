import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioAutenticadoRequest {
  id_usuario: number;
  email: string;
  nome: string;
  perfis: string[];
}

export const CurrentUser = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): UsuarioAutenticadoRequest | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticadoRequest }>();
    return request?.user;
  },
);
