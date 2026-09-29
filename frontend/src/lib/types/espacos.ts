/**
 * Domínio: Espaços físicos e reservas (RF07).
 * Referência: backend/prisma/schema.prisma (models EspacoFisico, Reserva).
 * Ver docs/arquitetura-frontend.md §4.
 */

/** Espaço físico de uma edição — sala, auditório, laboratório (RF07.1). */
export interface Espaco {
  id: string;
  eventoSlug: string;
  nome: string; // nome_sala
  tipo?: string; // tipo_espaco (Auditório, Laboratório…)
  capacidade: number; // capacidade_max
  local?: string; // descricao_local
  recursos?: string; // descricao_recursos_disponiveis
}

/**
 * Reserva de um espaço num intervalo (RF07.2). No backend a reserva vincula uma
 * atividade (id_atividade); aqui, enquanto atividades são #91, usamos um título
 * livre para a finalidade.
 */
export interface Reserva {
  id: string;
  espacoId: string;
  titulo: string;
  inicio: string; // ISO
  fim: string; // ISO
}
