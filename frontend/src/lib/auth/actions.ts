"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { cadastroRequest, loginRequest } from "@/lib/api";
import type { CredenciaisLogin, DadosCadastro } from "@/lib/types";

import { COOKIE_SESSAO } from "./config";

export type ResultadoAuth = { ok: true } | { ok: false; erro: string };

const OPCOES_COOKIE = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 7 dias
};

async function gravarSessao(token: string): Promise<void> {
  (await cookies()).set(COOKIE_SESSAO, token, OPCOES_COOKIE);
}

/** Login: autentica no backend e grava o JWT no cookie httpOnly. */
export async function entrarAction(
  cred: CredenciaisLogin,
): Promise<ResultadoAuth> {
  try {
    const { token } = await loginRequest(cred);
    await gravarSessao(token);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Não foi possível entrar.",
    };
  }
}

/** Cadastro: cria a conta, autentica e grava o JWT no cookie. */
export async function cadastrarAction(
  dados: DadosCadastro,
): Promise<ResultadoAuth> {
  try {
    const { token } = await cadastroRequest(dados);
    await gravarSessao(token);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Não foi possível criar a conta.",
    };
  }
}

/** Logout: apaga o cookie de sessão e volta ao login. */
export async function sairAction(): Promise<void> {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/login");
}
