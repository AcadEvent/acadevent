import type { Atividade, Evento, Ministrante } from "@/lib/types";

/**
 * Dados de exemplo servidos por trás de src/lib/api enquanto a API NestJS não
 * existe. NÃO importar diretamente nas páginas — use as funções de src/lib/api.
 */

export const mockEventos: Evento[] = [
  {
    slug: "sitc-2026",
    nome: "Simpósio de Inovação em Tecnologia e Computação",
    sigla: "SITC",
    edicao: "2026",
    descricao:
      "Três dias de palestras, minicursos e maratonas reunindo estudantes, docentes e profissionais da área de computação.",
    areaTematica: "Computação",
    instituicao: "Universidade Estadual — Campus Central",
    local: "Centro de Convenções, Cidade Universitária",
    status: "publicado",
    inscricao: "abertas",
    inicio: "2026-10-14T09:00:00-03:00",
    fim: "2026-10-16T18:00:00-03:00",
    aberturaInscricoes: "2026-08-01T00:00:00-03:00",
    capacidade: 500,
  },
  {
    slug: "enebio-2026",
    nome: "Encontro Nacional de Estudantes de Biologia",
    sigla: "ENEBIO",
    edicao: "2026",
    descricao:
      "Congresso com mostra de trabalhos, mesas-redondas e atividades de campo voltadas à pesquisa em ciências biológicas.",
    areaTematica: "Ciências Biológicas",
    instituicao: "Instituto de Biociências",
    local: "Auditório Central",
    status: "publicado",
    inscricao: "em_breve",
    inicio: "2026-11-05T08:00:00-03:00",
    fim: "2026-11-08T17:00:00-03:00",
    aberturaInscricoes: "2026-09-10T00:00:00-03:00",
    capacidade: 300,
  },
  {
    slug: "jornada-eng-2025",
    nome: "Jornada de Engenharias",
    sigla: "JENG",
    edicao: "2025",
    descricao:
      "Semana acadêmica com palestras técnicas, workshops e feira de projetos das engenharias.",
    areaTematica: "Engenharias",
    instituicao: "Faculdade de Engenharia",
    local: "Bloco de Engenharias",
    status: "encerrado",
    inscricao: "encerradas",
    inicio: "2025-09-22T08:00:00-03:00",
    fim: "2025-09-26T18:00:00-03:00",
    capacidade: 250,
  },
];

export const mockMinistrantes: Ministrante[] = [
  {
    id: "m1",
    nome: "Dra. Helena Prado",
    bio: "Pesquisadora em sistemas distribuídos e computação de alto desempenho.",
    instituicao: "Universidade Estadual",
    areaAtuacao: "Sistemas Distribuídos",
  },
  {
    id: "m2",
    nome: "Prof. Rafael Nunes",
    bio: "Trabalha com aprendizado de máquina aplicado à saúde.",
    instituicao: "Instituto de Computação",
    areaAtuacao: "Inteligência Artificial",
  },
];

export const mockAtividades: Atividade[] = [
  {
    id: "a1",
    titulo: "Abertura: O futuro da computação acadêmica",
    descricao: "Palestra de abertura do simpósio.",
    tipo: "palestra",
    inicio: "2026-10-14T09:30:00-03:00",
    fim: "2026-10-14T10:30:00-03:00",
    cargaHoraria: 1,
    local: "Auditório A",
    capacidade: 500,
    vagasRestantes: 320,
    ministrantesIds: ["m1"],
  },
  {
    id: "a2",
    titulo: "Minicurso: Introdução a contêineres",
    descricao: "Prática com Docker e orquestração básica.",
    tipo: "minicurso",
    inicio: "2026-10-14T14:00:00-03:00",
    fim: "2026-10-14T17:00:00-03:00",
    cargaHoraria: 3,
    local: "Laboratório 2",
    capacidade: 40,
    vagasRestantes: 6,
    ministrantesIds: ["m2"],
  },
  {
    id: "a3",
    titulo: "Mesa-redonda: Carreiras em IA",
    descricao: "Debate sobre trajetórias acadêmicas e de mercado em IA.",
    tipo: "mesa_redonda",
    inicio: "2026-10-15T10:00:00-03:00",
    fim: "2026-10-15T11:30:00-03:00",
    cargaHoraria: 1.5,
    local: "Auditório A",
    capacidade: 200,
    vagasRestantes: 0,
    ministrantesIds: ["m1", "m2"],
  },
];
