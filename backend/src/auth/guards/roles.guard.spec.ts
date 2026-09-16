import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  function createMockContext(user?: unknown): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('deve permitir acesso se a rota nao tiver decorator @Roles', () => {
    reflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve lancar UnauthorizedException se a rota exigir @Roles e o usuario for indefinido/nulo (sem fail-open)', () => {
    reflector.getAllAndOverride.mockReturnValue(['organizador']);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve retornar false sem quebrar em TypeError se user.perfis for uma string simples', () => {
    reflector.getAllAndOverride.mockReturnValue(['organizador']);
    const context = createMockContext({
      id_usuario: 1,
      perfis: 'organizador', // malformado: string em vez de array
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('deve retornar false sem quebrar em TypeError se user.perfis for um objeto', () => {
    reflector.getAllAndOverride.mockReturnValue(['organizador']);
    const context = createMockContext({
      id_usuario: 1,
      perfis: { tipo: 'organizador' }, // malformado: objeto
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('deve retornar false se user.perfis for null ou nao for array', () => {
    reflector.getAllAndOverride.mockReturnValue(['organizador']);
    const context = createMockContext({
      id_usuario: 1,
      perfis: null,
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('deve permitir acesso se o usuario possuir o papel exigido', () => {
    reflector.getAllAndOverride.mockReturnValue(['organizador']);
    const context = createMockContext({
      id_usuario: 1,
      perfis: ['Participante', 'Organizador'],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve permitir acesso irrestrito se o usuario possuir o papel administrador', () => {
    reflector.getAllAndOverride.mockReturnValue(['organizador']);
    const context = createMockContext({
      id_usuario: 1,
      perfis: ['Administrador'],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve negar acesso (retornar false) se o usuario nao tiver o papel exigido nem administrador', () => {
    reflector.getAllAndOverride.mockReturnValue(['organizador']);
    const context = createMockContext({
      id_usuario: 1,
      perfis: ['participante'],
    });

    expect(guard.canActivate(context)).toBe(false);
  });
});
