/**
 * Domínio: Autenticação — chamadas à API NestJS (server-side).
 *
 * Contrato #74: o backend usa JWT Bearer (POST /auth/login → { access_token }).
 * O token é guardado num cookie httpOnly pela camada de sessão (src/lib/auth) e
 * reenviado como `Authorization: Bearer` nas chamadas autenticadas. Estas funções
 * só falam com o backend — quem grava/lê o cookie são os Server Actions e o
 * getSession.
 */
import type {
  CredenciaisLogin,
  DadosCadastro,
  PerfilUsuario,
  UsuarioAutenticado,
} from "@/lib/types";
import { API_URL } from "./_client";

/** Piso de tamanho de senha (validação de formulário; alinhar com o backend). */
export const SENHA_MIN_CARACTERES = 8;

/** Usuário como o backend devolve (snake_case, perfis como strings). */
interface UsuarioApi {
  id_usuario: number;
  nome: string;
  email: string;
  url_foto?: string | null;
  perfis: string[];
}

interface RespostaAuth {
  access_token: string;
  usuario: UsuarioApi;
}

function toUsuario(u: UsuarioApi): UsuarioAutenticado {
  return {
    id: String(u.id_usuario),
    nome: u.nome,
    email: u.email,
    urlFoto: u.url_foto ?? undefined,
    perfis: u.perfis as PerfilUsuario[],
  };
}

async function postAuth(
  path: string,
  body: unknown,
  erros: Record<number, string>,
): Promise<RespostaAuth> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      erros[res.status] ?? "Não foi possível concluir agora. Tente novamente.",
    );
  }
  return res.json() as Promise<RespostaAuth>;
}

/** Login por e-mail e senha (RF02.1.1). */
export async function loginRequest(
  cred: CredenciaisLogin,
): Promise<{ token: string; usuario: UsuarioAutenticado }> {
  const r = await postAuth(
    "/auth/login",
    { email: cred.email.trim().toLowerCase(), senha: cred.senha },
    { 401: "E-mail ou senha incorretos." },
  );
  return { token: r.access_token, usuario: toUsuario(r.usuario) };
}

/** Cadastro de novo usuário (RF02.1.1). */
export async function cadastroRequest(
  dados: DadosCadastro,
): Promise<{ token: string; usuario: UsuarioAutenticado }> {
  const r = await postAuth(
    "/auth/cadastro",
    {
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
      senha: dados.senha,
    },
    { 409: "Este e-mail já está cadastrado." },
  );
  return { token: r.access_token, usuario: toUsuario(r.usuario) };
}

/** Resolve o usuário atual a partir do token (GET /auth/me, Bearer). */
export async function meRequest(token: string): Promise<UsuarioAutenticado> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Sessão inválida.");
  return toUsuario((await res.json()) as UsuarioApi);
}
