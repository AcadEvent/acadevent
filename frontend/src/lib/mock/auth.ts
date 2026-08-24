import type { UsuarioAutenticado } from "@/lib/types";

/**
 * Dados de exemplo servidos por trás de src/lib/api enquanto a API de
 * autenticação não existe. Não importar direto nas páginas.
 */

/** Senha das contas de exemplo. */
export const SENHA_DEMO = "acadevent123";

export const mockUsuarios: UsuarioAutenticado[] = [
  {
    id: "1",
    nome: "Ana Souza",
    email: "participante@acadevent.dev",
    perfis: ["participante"],
  },
  {
    id: "2",
    nome: "Prof. Carlos Lima",
    email: "ministrante@acadevent.dev",
    perfis: ["participante", "ministrante"],
  },
  {
    id: "3",
    nome: "Marina Alves",
    email: "organizador@acadevent.dev",
    perfis: ["participante", "organizador", "comissao"],
  },
];

/**
 * Senha por e-mail. Existe para o mock validar o login e para que uma conta
 * criada em /cadastro consiga entrar na mesma sessão. No sistema real nada
 * disso fica no front: o backend guarda apenas o hash bcrypt (RNF03.1).
 */
export const mockSenhas: Record<string, string> = Object.fromEntries(
  mockUsuarios.map((usuario) => [usuario.email, SENHA_DEMO]),
);
