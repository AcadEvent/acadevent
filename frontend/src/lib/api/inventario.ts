/**
 * Domínio: Inventário físico (RF08) — acesso a dados (mock por enquanto).
 * TODO(#92): trocar por fetch (POST /inventario/itens, GET /inventario/itens/edicao/:id,
 * POST /inventario/retirar, PATCH /inventario/devolver/:id, GET alertas/relatorio).
 * Ver docs/arquitetura-frontend.md §4.
 */
import type { ItemInventario } from "@/lib/types";
import { mockItensInventario } from "@/lib/mock/inventario";
import { fake } from "./_client";

/** Itens de inventário da edição (RF08.1). */
export function getItensInventario(
  eventoSlug: string,
): Promise<ItemInventario[]> {
  return fake(mockItensInventario.filter((i) => i.eventoSlug === eventoSlug));
}

/** Cadastra um item; começa com toda a quantidade disponível (RF08.1). */
export function criarItem(input: {
  eventoSlug: string;
  nome: string;
  descricao?: string;
  quantidadeTotal: number;
  quantidadeMinima: number;
}): Promise<ItemInventario> {
  if (
    !Number.isInteger(input.quantidadeTotal) ||
    input.quantidadeTotal <= 0 ||
    !Number.isInteger(input.quantidadeMinima) ||
    input.quantidadeMinima < 0
  ) {
    return Promise.reject(
      new RangeError("As quantidades devem ser números inteiros válidos."),
    );
  }
  const item: ItemInventario = {
    ...input,
    id: `item-${crypto.randomUUID().slice(0, 8)}`,
    quantidadeDisponivel: input.quantidadeTotal,
  };
  mockItensInventario.push(item);
  return fake(item);
}

export type ResultadoMovimento =
  | { ok: true; item: ItemInventario }
  | { ok: false; erro: string };

/** Retirada de itens do estoque (RF08.2). Rejeita quantidade indisponível. */
export function retirarItem(
  id: string,
  quantidade: number,
): Promise<ResultadoMovimento> {
  const item = mockItensInventario.find((i) => i.id === id);
  if (!item) return fake({ ok: false, erro: "Item não encontrado." });
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return fake({ ok: false, erro: "Informe uma quantidade válida." });
  }
  if (quantidade > item.quantidadeDisponivel) {
    return fake({
      ok: false,
      erro: `Só há ${item.quantidadeDisponivel} em estoque.`,
    });
  }
  item.quantidadeDisponivel -= quantidade;
  return fake({ ok: true, item });
}

/** Devolução ao estoque (RF08.2). Rejeita devolver além do total. */
export function devolverItem(
  id: string,
  quantidade: number,
): Promise<ResultadoMovimento> {
  const item = mockItensInventario.find((i) => i.id === id);
  if (!item) return fake({ ok: false, erro: "Item não encontrado." });
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return fake({ ok: false, erro: "Informe uma quantidade válida." });
  }
  if (item.quantidadeDisponivel + quantidade > item.quantidadeTotal) {
    return fake({
      ok: false,
      erro: "Devolução excede o total cadastrado do item.",
    });
  }
  item.quantidadeDisponivel += quantidade;
  return fake({ ok: true, item });
}
