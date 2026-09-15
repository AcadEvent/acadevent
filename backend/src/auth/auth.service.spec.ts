import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    perfilParticipante: {
      create: jest.fn(),
    },
    perfilUsuario: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('cadastrar', () => {
    it('deve lancar BadRequestException se o email ja estiver em uso', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id_usuario: 1,
        email: 'existente@teste.com',
      });

      await expect(
        service.cadastrar({
          nome: 'Teste',
          email: 'existente@teste.com',
          senha: 'senha123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar novo usuario com perfil participante e retornar token', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.usuario.create.mockResolvedValue({
        id_usuario: 10,
        nome: 'Novo Usuario',
        email: 'novo@teste.com',
      });

      const resultado = await service.cadastrar({
        nome: 'Novo Usuario',
        email: 'novo@teste.com',
        senha: 'senha123',
      });

      expect(resultado).toBeDefined();
      expect(resultado.access_token).toBe('mocked_jwt_token');
      expect(resultado.usuario.perfis).toContain('participante');
    });
  });

  describe('login', () => {
    it('deve lancar UnauthorizedException se usuario nao existir', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'naoexiste@teste.com',
          senha: 'senha123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lancar UnauthorizedException se a senha for incorreta', async () => {
      const hash = await bcrypt.hash('senha_correta', 10);
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id_usuario: 1,
        email: 'user@teste.com',
        senha_hash: hash,
        perfis: [{ tipo_perfil: 'participante' }],
      });

      await expect(
        service.login({
          email: 'user@teste.com',
          senha: 'senha_errada',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve realizar login com sucesso se as credenciais estiverem corretas', async () => {
      const hash = await bcrypt.hash('senha_correta', 10);
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id_usuario: 1,
        nome: 'Usuario Teste',
        email: 'user@teste.com',
        senha_hash: hash,
        perfis: [{ tipo_perfil: 'organizador' }],
      });

      const resultado = await service.login({
        email: 'user@teste.com',
        senha: 'senha_correta',
      });

      expect(resultado).toBeDefined();
      expect(resultado.access_token).toBe('mocked_jwt_token');
      expect(resultado.usuario.perfis).toContain('organizador');
    });
  });
});
