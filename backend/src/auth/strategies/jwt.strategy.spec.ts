import { PrismaService } from '../../prisma/prisma.service';
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

  it('deve validar payload do JWT e mapear campos do usuario corretamente', async () => {
    process.env.JWT_SECRET = 'segredo_de_teste_super_seguro_123';
    const strategy = new JwtStrategy();

    const payload: JwtPayload = {
      sub: 42,
      email: 'usuario@teste.com',
      nome: 'Usuario Teste',
      perfis: ['participante', 'organizador'],
    };

    const resultado = await strategy.validate(payload);

    expect(resultado).toEqual({
      id_usuario: 42,
      email: 'usuario@teste.com',
      nome: 'Usuario Teste',
      perfis: ['participante', 'organizador'],
    });
  });

  describe('perfis vigentes (consulta ao banco)', () => {
    const payload: JwtPayload = {
      sub: 7,
      email: 'novo@teste.com',
      nome: 'Novo Organizador',
      perfis: ['participante'],
    };

    function criarComPerfis(registros: { tipo_perfil: string }[]) {
      process.env.JWT_SECRET = 'segredo_de_teste_super_seguro_123';
      const findMany = jest.fn().mockResolvedValue(registros);
      const prisma = {
        perfilUsuario: { findMany },
      } as unknown as PrismaService;
      return { strategy: new JwtStrategy(prisma), findMany };
    }

    it('deve usar os perfis do banco quando o token esta desatualizado (organizador criado depois do login)', async () => {
      const { strategy, findMany } = criarComPerfis([
        { tipo_perfil: 'Participante' },
        { tipo_perfil: 'Organizador' },
      ]);

      const resultado = await strategy.validate(payload);

      expect(resultado.perfis).toEqual(['participante', 'organizador']);
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_usuario: 7 } }),
      );
    });

    it('deve manter os perfis do token quando o banco nao tem registros', async () => {
      const { strategy } = criarComPerfis([]);

      const resultado = await strategy.validate(payload);

      expect(resultado.perfis).toEqual(['participante']);
    });
  });
});
