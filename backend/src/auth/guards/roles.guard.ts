import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { perfis?: unknown };
    }>();
    const user = request?.user;
    if (!user) {
      throw new UnauthorizedException('Usuario nao autenticado.');
    }

    if (!Array.isArray(user.perfis)) {
      return false;
    }

    const rawPerfis: unknown[] = user.perfis;
    const perfisUsuario: string[] = rawPerfis
      .filter((p: unknown): p is string => typeof p === 'string')
      .map((p: string) => p.toLowerCase());

    if (perfisUsuario.includes('administrador')) {
      return true;
    }

    return requiredRoles.some((role) =>
      perfisUsuario.includes(role.toLowerCase()),
    );
  }
}
