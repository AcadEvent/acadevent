/**
 * Proxy de download de arquivos (RF10 / RNF03). GET /storage/arquivos exige JWT
 * no backend, mas links de navegador não enviam Bearer: lemos o cookie httpOnly
 * da sessão e repassamos o arquivo autenticado.
 */
import { NextResponse } from "next/server";

import { API_URL } from "@/lib/api/_client";
import { getToken } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subpasta: string; nome: string }> },
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { subpasta, nome } = await params;
  const upstream = await fetch(
    `${API_URL}/storage/arquivos/${encodeURIComponent(subpasta)}/${encodeURIComponent(nome)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!upstream.ok) {
    return NextResponse.json(
      { message: "Arquivo indisponível." },
      { status: upstream.status },
    );
  }

  const headers = new Headers();
  for (const h of ["content-type", "content-length"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(upstream.body, { status: 200, headers });
}
