import { JwtStrategy, JwtPayload } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve lancar Error fatal no startup se JWT_SECRET nao estiver definido', () => {
    delete process.env.JWT_SECRET;

    expect(() => new JwtStrategy()).toThrow(
      'JWT_SECRET nao definido no ambiente.',
    );
  });

  it('deve instanciar com sucesso quando JWT_SECRET estiver definido', () => {
    process.env.JWT_SECRET = 'segredo_de_teste_super_seguro_123';

    const strategy = new JwtStrategy();
    expect(strategy).toBeDefined();
  });

  it('deve validar payload do JWT e mapear campos do usuario corretamente', () => {
    process.env.JWT_SECRET = 'segredo_de_teste_super_seguro_123';
    const strategy = new JwtStrategy();

    const payload: JwtPayload = {
      sub: 42,
      email: 'usuario@teste.com',
      nome: 'Usuario Teste',
      perfis: ['participante', 'organizador'],
    };

    const resultado = strategy.validate(payload);

    expect(resultado).toEqual({
      id_usuario: 42,
      email: 'usuario@teste.com',
      nome: 'Usuario Teste',
      perfis: ['participante', 'organizador'],
    });
  });
});
