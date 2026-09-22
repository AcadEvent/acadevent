import type {
  CupomDesconto,
  InscricaoEdicao,
  LoteIngresso,
} from "@/lib/types";

/**
 * Dados de exemplo servidos por trás de src/lib/api enquanto a API NestJS não
 * existe. NÃO importar diretamente nas páginas — use as funções de src/lib/api.
 *
 * Os slugs acompanham os de mock/eventos.ts para exercitar os estados do fluxo
 * de inscrição: lote vigente (sitc-2026), lote ainda por abrir (enebio-2026) e
 * lote encerrado (jornada-eng-2025).
 */

export const mockLotes: LoteIngresso[] = [
  {
    id: "l1",
    eventoSlug: "sitc-2026",
    nome: "1º lote — antecipado",
    preco: 60,
    abertura: "2026-08-01T09:00:00-03:00",
    encerramento: "2026-09-15T23:59:00-03:00",
    vagas: 200,
    vagasRestantes: 84,
  },
  {
    id: "l2",
    eventoSlug: "sitc-2026",
    nome: "2º lote — regular",
    preco: 90,
    abertura: "2026-09-16T09:00:00-03:00",
    encerramento: "2026-10-10T23:59:00-03:00",
    vagas: 250,
    vagasRestantes: 250,
  },
  {
    id: "l3",
    eventoSlug: "enebio-2026",
    nome: "Lote único",
    preco: 45,
    abertura: "2026-09-10T09:00:00-03:00",
    encerramento: "2026-11-01T23:59:00-03:00",
    vagas: 300,
    vagasRestantes: 300,
  },
  {
    id: "l4",
    eventoSlug: "jornada-eng-2025",
    nome: "Lote único",
    preco: 0,
    abertura: "2025-08-01T09:00:00-03:00",
    encerramento: "2025-09-20T23:59:00-03:00",
    vagas: 250,
    vagasRestantes: 0,
  },
];

/**
 * Cupons de exemplo (RF04.3): um percentual válido, um de valor fixo, um vencido
 * e um sem usos restantes — para exercitar as mensagens do checkout.
 */
export const mockCupons: CupomDesconto[] = [
  {
    codigo: "SITC10",
    eventoSlug: "sitc-2026",
    tipo: "percentual",
    valor: 10,
    validoAte: "2026-10-10T23:59:00-03:00",
    usosRestantes: 50,
  },
  {
    codigo: "CALOURO30",
    eventoSlug: "sitc-2026",
    tipo: "valor_fixo",
    valor: 30,
    validoAte: "2026-10-10T23:59:00-03:00",
    usosRestantes: 20,
  },
  {
    codigo: "EARLYBIRD",
    eventoSlug: "sitc-2026",
    tipo: "percentual",
    valor: 25,
    validoAte: "2026-08-31T23:59:00-03:00",
    usosRestantes: 10,
  },
  {
    codigo: "ENEBIO100",
    eventoSlug: "enebio-2026",
    tipo: "percentual",
    valor: 100,
    usosRestantes: 0,
  },
];

/**
 * Inscrições já registradas. Começa com uma de exemplo para que
 * /eventos/sitc-2026/inscricao/confirmacao?inscricao=insc-demo possa ser aberta
 * direto; o checkout acrescenta as novas aqui (vive só na memória do servidor).
 */
export const mockInscricoes: InscricaoEdicao[] = [
  {
    id: "insc-demo",
    codigo: "SITC26-0001",
    eventoSlug: "sitc-2026",
    participante: "Participante de exemplo",
    statusPagamento: "confirmado",
    loteId: "l1",
    loteNome: "1º lote — antecipado",
    valorBruto: 60,
    cupom: { codigo: "SITC10", tipo: "percentual", valor: 10, desconto: 6 },
    valor: 54,
    metodoPagamento: "pix",
    atividadesIds: ["a1"],
    criadaEm: "2026-09-01T14:20:00-03:00",
    pagaEm: "2026-09-01T14:21:00-03:00",
  },
];
