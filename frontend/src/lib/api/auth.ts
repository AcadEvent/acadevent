/**
 * Domínio: Autenticação. Acesso a dados, hoje sobre mock.
 * Ver docs/arquitetura-frontend.md §4. Não importar de src/lib/mock nas páginas.
 *
 * TODO(auth): trocar o corpo destas funções por fetch em ${API_URL}/auth/...
 * quando o contrato do NestJS existir (RNF03.1) e passar a gravar a sessão
 * (cookie httpOnly) para ligar o guard em src/proxy.ts.
 */
import type {
  CredenciaisLogin,
  DadosCadastro,
  UsuarioAutenticado,
} from "@/lib/types";
import { SENHA_DEMO, mockSenhas, mockUsuarios } from "@/lib/mock/auth";
import { fake } from "./_client";

/**
 * Piso de tamanho de senha. Os requisitos não fixam política de senha, então
 * adotamos 8 caracteres.
 * TODO(auth): alinhar com a validação do backend quando ela existir.
 */
export const SENHA_MIN_CARACTERES = 8;

/**
 * Conta de exemplo mostrada na tela de login para o time conseguir navegar nas
 * áreas autenticadas.
 * TODO(auth): remover junto com o mock ao integrar o login real.
 */
export const CONTA_DEMO = {
  email: mockUsuarios[0].email,
  senha: SENHA_DEMO,
};

/** Mensagem única para não revelar se o e-mail existe. */
const ERRO_CREDENCIAIS = "E-mail ou senha incorretos.";

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Login por e-mail e senha (RF02.1.1). Lança erro se as credenciais não conferem. */
export async function postLogin({
  email,
  senha,
}: CredenciaisLogin): Promise<UsuarioAutenticado> {
  const emailNormalizado = normalizarEmail(email);
  const usuario = mockUsuarios.find(
    (u) => u.email.toLowerCase() === emailNormalizado,
  );

  if (!usuario || mockSenhas[usuario.email] !== senha) {
    throw new Error(ERRO_CREDENCIAIS);
  }

  return fake(usuario);
}

/**
 * Cadastro de novo usuário (RF02.1.1). Lança erro se o e-mail já está em uso.
 * A conta criada fica só em memória, então recarregar a aba a perde.
 */
export async function postCadastro({
  nome,
  email,
  senha,
}: DadosCadastro): Promise<UsuarioAutenticado> {
  const emailNormalizado = normalizarEmail(email);

  if (mockUsuarios.some((u) => u.email.toLowerCase() === emailNormalizado)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  const novo: UsuarioAutenticado = {
    id: String(mockUsuarios.length + 1),
    nome: nome.trim(),
    email: emailNormalizado,
    // Todo usuário nasce participante. Os outros papéis são atribuídos por
    // evento (RF02.2) ou pelo administrador da plataforma (RF02.1.3).
    perfis: ["participante"],
  };

  // TODO(auth): substituir por POST /auth/cadastro. A senha vai para o backend,
  // que armazena apenas o hash bcrypt (RNF03.1).
  mockUsuarios.push(novo);
  mockSenhas[novo.email] = senha;

  return fake(novo);
}
