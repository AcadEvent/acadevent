import { redirect } from "next/navigation";

import AcessoNegado from "@/components/layout/AcessoNegado";
import { getSession, hasRole } from "@/lib/auth/session";

/**
 * Gate de PERFIL da gestão de um evento específico (issue #41). Listar/criar
 * eventos é aberto a qualquer usuário autenticado (ver o layout do grupo); já
 * GERIR um evento exige perfil de gestão. A posse do evento em si (é ESTE
 * usuário o organizador DESTE evento?) continua validada no backend (RolesGuard).
 */
export default async function GerenciarEventoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasRole(session, ["organizador", "comissao", "admin"])) {
    return <AcessoNegado area="gestão de eventos" />;
  }

  return <>{children}</>;
}
