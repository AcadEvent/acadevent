import type { Notificacao, PainelEvento } from "@/lib/types";

/**
 * Dados de exemplo servidos por trás de src/lib/api. Não importar direto nas
 * páginas. Os slugs coincidem com os de mock/eventos.ts para a navegação entre
 * a área pública e o painel ser totalmente coerente.
 */
export const mockPainelEventos: PainelEvento[] = [
  {
    slug: "sitc-2026",
    nome: "Simpósio de Inovação em Tecnologia e Computação",
    sigla: "SITC",
    edicao: "2026",
    descricao:
      "Três dias de palestras, minicursos e maratonas reunindo estudantes, docentes e profissionais da área de computação.",
    inicio: "2026-10-14T09:00:00-03:00",
    fim: "2026-10-16T18:00:00-03:00",
    local: "Centro de Convenções, Cidade Universitária",
    statusInscricao: "confirmada",
    papeis: ["participante"],
    atividadesInscritas: 4,
    certificadosDisponiveis: 0,
    recibosDisponiveis: 1,
    submissoesEnviadas: 1,
    atividades: [
      {
        id: "1",
        titulo: "Abertura e palestra magna: IA na pesquisa acadêmica",
        inicio: "2026-10-14T09:00:00-03:00",
        fim: "2026-10-14T11:00:00-03:00",
        local: "Auditório Principal",
      },
      {
        id: "2",
        titulo: "Minicurso de Análise de Dados com Python",
        inicio: "2026-10-14T14:00:00-03:00",
        fim: "2026-10-14T18:00:00-03:00",
        local: "Laboratório 7",
      },
      {
        id: "3",
        titulo: "Mesa-redonda: Ética em sistemas autônomos",
        inicio: "2026-10-15T10:00:00-03:00",
        fim: "2026-10-15T12:00:00-03:00",
        local: "Sala 201",
      },
      {
        id: "4",
        titulo: "Maratona de Programação",
        inicio: "2026-10-16T08:00:00-03:00",
        fim: "2026-10-16T13:00:00-03:00",
        local: "Laboratório 3",
      },
    ],
  },
  {
    slug: "jornada-eng-2025",
    nome: "Jornada de Engenharias",
    sigla: "JENG",
    edicao: "2025",
    descricao:
      "Semana acadêmica com palestras técnicas, workshops e feira de projetos das engenharias.",
    inicio: "2025-09-22T08:00:00-03:00",
    fim: "2025-09-26T18:00:00-03:00",
    local: "Bloco de Engenharias",
    statusInscricao: "confirmada",
    papeis: ["participante", "ministrante"],
    atividadesInscritas: 3,
    certificadosDisponiveis: 2,
    recibosDisponiveis: 1,
    submissoesEnviadas: 2,
    atividades: [
      {
        id: "6",
        titulo: "Painel: Energias renováveis no campus",
        inicio: "2025-09-22T09:00:00-03:00",
        fim: "2025-09-22T11:00:00-03:00",
        local: "Auditório da Engenharia",
      },
      {
        id: "7",
        titulo: "Minicurso: Estruturas sustentáveis",
        inicio: "2025-09-23T14:00:00-03:00",
        fim: "2025-09-23T18:00:00-03:00",
        local: "Sala E-12",
      },
      {
        id: "8",
        titulo: "Visita técnica: Estação de tratamento",
        inicio: "2025-09-24T08:00:00-03:00",
        fim: "2025-09-24T12:00:00-03:00",
        local: "Estação de Tratamento de Água",
      },
    ],
  },
  {
    slug: "enebio-2026",
    nome: "Encontro Nacional de Estudantes de Biologia",
    sigla: "ENEBIO",
    edicao: "2026",
    descricao:
      "Congresso com mostra de trabalhos, mesas-redondas e atividades de campo voltadas à pesquisa em ciências biológicas.",
    inicio: "2026-11-05T08:00:00-03:00",
    fim: "2026-11-08T17:00:00-03:00",
    local: "Auditório Central",
    statusInscricao: "pendente",
    papeis: ["participante"],
    atividadesInscritas: 1,
    certificadosDisponiveis: 0,
    recibosDisponiveis: 0,
    submissoesEnviadas: 0,
    atividades: [
      {
        id: "5",
        titulo: "Oficina de coleta e identificação de espécies",
        inicio: "2026-11-06T08:00:00-03:00",
        fim: "2026-11-06T12:00:00-03:00",
        local: "Laboratório de Botânica",
      },
    ],
  },
  {
    slug: "jorn-eng-2025",
    nome: "Jornada de Engenharias",
    sigla: "JENG",
    edicao: "2025",
    descricao:
      "Semana acadêmica com palestras técnicas, workshops e feira de projetos das engenharias.",
    inicio: "2025-09-22T08:00:00-03:00",
    fim: "2025-09-26T18:00:00-03:00",
    local: "Bloco de Engenharias",
    statusInscricao: "confirmada",
    papeis: ["participante", "ministrante"],
    atividadesInscritas: 3,
    certificadosDisponiveis: 2,
    recibosDisponiveis: 1,
    submissoesEnviadas: 2,
    atividades: [
      {
        id: "6",
        titulo: "Painel: Energias renováveis no campus",
        inicio: "2025-09-22T09:00:00-03:00",
        fim: "2025-09-22T11:00:00-03:00",
        local: "Auditório da Engenharia",
      },
      {
        id: "7",
        titulo: "Minicurso: Estruturas sustentáveis",
        inicio: "2025-09-23T14:00:00-03:00",
        fim: "2025-09-23T18:00:00-03:00",
        local: "Sala E-12",
      },
      {
        id: "8",
        titulo: "Visita técnica: Estação de tratamento",
        inicio: "2025-09-24T08:00:00-03:00",
        fim: "2025-09-24T12:00:00-03:00",
        local: "Estação de Tratamento de Água",
      },
    ],
  },
];

export const mockNotificacoes: Notificacao[] = [
  {
    id: "1",
    titulo: "Sala alterada: Minicurso de Análise de Dados",
    mensagem:
      "A atividade foi remanejada do Laboratório 3 para o Laboratório 7, no mesmo horário.",
    data: "2026-08-18T12:00:00-03:00",
  },
  {
    id: "2",
    titulo: "Pagamento pendente no ENEBIO 2026",
    mensagem:
      "Sua inscrição só será confirmada após a quitação do lote promocional.",
    data: "2026-08-17T12:00:00-03:00",
  },
  {
    id: "3",
    titulo: "Certificados liberados: JENG 2025",
    mensagem:
      "Os certificados das atividades com presença confirmada já estão disponíveis para download.",
    data: "2026-08-11T12:00:00-03:00",
  },
  {
    id: "4",
    titulo: "Inscrições abertas para o SITC 2026",
    mensagem:
      "A grade de minicursos já pode ser consultada e as vagas são limitadas.",
    data: "2026-08-04T12:00:00-03:00",
  },
];
