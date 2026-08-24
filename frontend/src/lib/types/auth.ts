/**
 * Domínio: Autenticação e conta do usuário (RF02.1, RNF03.1).
 * Referência de campos: backend/prisma/schema.prisma (models Usuario,
 * PerfilUsuario). Ver docs/arquitetura-frontend.md §4.
 */
import type { PerfilUsuario } from "./comum";

/** Credenciais do formulário de login (RF02.1.1). */
export interface CredenciaisLogin {
  email: string;
  senha: string;
}

/** Dados do formulário de cadastro (RF02.1.1). */
export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

/** Usuário devolvido pela autenticação. Achata Usuario e PerfilUsuario. */
export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  urlFoto?: string;
  perfis: PerfilUsuario[];
}
