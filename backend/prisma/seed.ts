import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ts = (value: string) => new Date(value);

const SEQUENCE_COLUMNS: Array<[string, string]> = [
  ['usuario', 'id_usuario'],
  ['notificacao', 'id_notificacao'],
  ['perfil_administrador', 'id_administrador'],
  ['perfil_organizador', 'id_organizador'],
  ['perfil_ministrante', 'id_ministrante'],
  ['perfil_participante', 'id_participante'],
  ['perfil_parecerista', 'id_parecerista'],
  ['perfil_autor', 'id_autor'],
  ['perfil_usuario', 'id_perfil'],
  ['evento', 'id_evento'],
  ['edicao', 'id_edicao'],
  ['espaco_fisico', 'id_espaco'],
  ['item_inventario_fisico', 'id_item'],
  ['registro_inventario', 'id_registro_item'],
  ['grupo_trabalho', 'id_grupo'],
  ['perfil_comissao', 'id_comissao'],
  ['turno', 'id_turno'],
  ['atividade', 'id_atividade'],
  ['atividade_ministrante', 'id_atividade_ministrante'],
  ['reserva', 'id_reserva'],
  ['material_digital', 'id_material'],
  ['comunicado', 'id_comunicado'],
  ['lote_ingresso', 'id_lote'],
  ['cupom', 'id_cupom'],
  ['inscricao_edicao', 'id_inscricao_edicao'],
  ['pagamento', 'id_pagamento'],
  ['inscricao_atividade', 'id_inscricao_atividade'],
  ['presenca', 'id_presenca'],
  ['anais', 'id_anais'],
  ['trabalho_academico', 'id_trabalho'],
  ['submissao', 'id_submissao'],
  ['avaliacao', 'id_avaliacao'],
  ['correcao', 'id_correcao'],
  ['modelo_trabalho_cientifico', 'id_modelo'],
  ['modelo_certificado', 'id_modelo'],
  ['signatario', 'id_signatario'],
  ['certificado', 'id_certificado'],
  ['midia_evento', 'id_material'],
  ['patrocinador', 'id_patrocinador'],
];

async function resetSequences() {
  for (const [table, column] of SEQUENCE_COLUMNS) {
    await prisma.$executeRawUnsafe(
      `SELECT CASE
         WHEN pg_get_serial_sequence('${table}', '${column}') IS NULL THEN 0
         ELSE setval(
           pg_get_serial_sequence('${table}', '${column}'),
           GREATEST(COALESCE((SELECT MAX(${column}) FROM ${table}), 1), 1),
           (SELECT MAX(${column}) FROM ${table}) IS NOT NULL
         )
       END`,
    );
  }
}

async function main() {
  await prisma.usuario.upsert({
    where: { id_usuario: 1 },
    update: {},
    create: {
      id_usuario: 1,
      nome: 'Bradley Hayes',
      email: 'admin@uems.br',
      senha_hash: 'hash123',
      url_foto: 'img/adm.png',
    },
  });
  await prisma.usuario.upsert({
    where: { id_usuario: 2 },
    update: {},
    create: {
      id_usuario: 2,
      nome: 'Mitchell Carver',
      email: 'coord.comp@uems.br',
      senha_hash: 'hash123',
      url_foto: 'img/coord_comp.png',
    },
  });
  await prisma.usuario.upsert({
    where: { id_usuario: 3 },
    update: {},
    create: {
      id_usuario: 3,
      nome: 'Eleanor Vance',
      email: 'coord.enf@uems.br',
      senha_hash: 'hash123',
      url_foto: 'img/coord_enf.png',
    },
  });
  await prisma.usuario.upsert({
    where: { id_usuario: 4 },
    update: {},
    create: {
      id_usuario: 4,
      nome: 'Trevor Jenkins',
      email: 'prof.cpp@uems.br',
      senha_hash: 'hash123',
      url_foto: 'img/min_comp.png',
    },
  });
  await prisma.usuario.upsert({
    where: { id_usuario: 5 },
    update: {},
    create: {
      id_usuario: 5,
      nome: 'Sarah Linwood',
      email: 'prof.saude@uems.br',
      senha_hash: 'hash123',
      url_foto: 'img/min_enf.png',
    },
  });
  await prisma.usuario.upsert({
    where: { id_usuario: 6 },
    update: {},
    create: {
      id_usuario: 6,
      nome: 'Caleb Foster',
      email: 'kaio.aluno@acad.br',
      senha_hash: 'hash123',
      url_foto: 'img/aluno1.png',
    },
  });
  await prisma.usuario.upsert({
    where: { id_usuario: 7 },
    update: {},
    create: {
      id_usuario: 7,
      nome: 'Madison Cole',
      email: 'maria.aluno@acad.br',
      senha_hash: 'hash123',
      url_foto: 'img/aluno2.png',
    },
  });
  await prisma.usuario.upsert({
    where: { id_usuario: 8 },
    update: {},
    create: {
      id_usuario: 8,
      nome: 'Julian Bates',
      email: 'parecerista@uems.br',
      senha_hash: 'hash123',
      url_foto: 'img/par.png',
    },
  });

  await prisma.perfilAdministrador.upsert({
    where: { id_administrador: 1 },
    update: {},
    create: { id_administrador: 1, id_usuario: 1 },
  });
  await prisma.perfilOrganizador.upsert({
    where: { id_organizador: 1 },
    update: {},
    create: { id_organizador: 1, id_usuario: 2 },
  });
  await prisma.perfilOrganizador.upsert({
    where: { id_organizador: 2 },
    update: {},
    create: { id_organizador: 2, id_usuario: 3 },
  });
  await prisma.perfilMinistrante.upsert({
    where: { id_ministrante: 1 },
    update: {},
    create: {
      id_ministrante: 1,
      id_usuario: 4,
      biografia: 'Especialista em C++ e Infraestrutura Linux Ubuntu.',
      area_atuacao: 'Ciência da Computação',
    },
  });
  await prisma.perfilMinistrante.upsert({
    where: { id_ministrante: 2 },
    update: {},
    create: {
      id_ministrante: 2,
      id_usuario: 5,
      biografia: 'Enfermeiro especialista em urgência e emergência.',
      area_atuacao: 'Enfermagem',
    },
  });
  await prisma.perfilParticipante.upsert({
    where: { id_participante: 1 },
    update: {},
    create: { id_participante: 1, id_usuario: 6 },
  });
  await prisma.perfilParticipante.upsert({
    where: { id_participante: 2 },
    update: {},
    create: { id_participante: 2, id_usuario: 7 },
  });
  await prisma.perfilParecerista.upsert({
    where: { id_parecerista: 1 },
    update: {},
    create: { id_parecerista: 1, id_usuario: 8 },
  });
  await prisma.perfilAutor.upsert({
    where: { id_autor: 1 },
    update: {},
    create: { id_autor: 1, id_usuario: 6 },
  });

  const perfisUsuario: Array<{ id_perfil: number; id_usuario: number; tipo_perfil: string }> = [
    { id_perfil: 1, id_usuario: 1, tipo_perfil: 'Administrador' },
    { id_perfil: 2, id_usuario: 2, tipo_perfil: 'Organizador' },
    { id_perfil: 3, id_usuario: 3, tipo_perfil: 'Organizador' },
    { id_perfil: 4, id_usuario: 4, tipo_perfil: 'Ministrante' },
    { id_perfil: 5, id_usuario: 5, tipo_perfil: 'Ministrante' },
    { id_perfil: 6, id_usuario: 6, tipo_perfil: 'Participante' },
    { id_perfil: 7, id_usuario: 7, tipo_perfil: 'Participante' },
    { id_perfil: 8, id_usuario: 8, tipo_perfil: 'Parecerista' },
    { id_perfil: 9, id_usuario: 6, tipo_perfil: 'Autor' },
  ];
  for (const perfil of perfisUsuario) {
    await prisma.perfilUsuario.upsert({
      where: { id_perfil: perfil.id_perfil },
      update: {},
      create: perfil,
    });
  }

  await prisma.notificacao.upsert({
    where: { id_notificacao: 1 },
    update: {},
    create: {
      id_notificacao: 1,
      id_usuario: 6,
      titulo: 'Bem-vindo(a)',
      mensagem: 'Seu cadastro na plataforma foi concluído.',
      data: ts('2026-05-01 10:00:00'),
    },
  });

  await prisma.evento.upsert({
    where: { id_evento: 1 },
    update: {},
    create: {
      id_evento: 1,
      id_organizador: 1,
      nome_marca: 'Semana Integrada da Computação',
      descricao_geral: 'Evento de tecnologia e desenvolvimento de software.',
    },
  });
  await prisma.evento.upsert({
    where: { id_evento: 2 },
    update: {},
    create: {
      id_evento: 2,
      id_organizador: 2,
      nome_marca: 'Semana da Enfermagem',
      descricao_geral: 'Evento voltado às práticas de cuidado e saúde pública.',
    },
  });

  await prisma.edicao.upsert({
    where: { id_edicao: 1 },
    update: {},
    create: {
      id_edicao: 1,
      id_evento: 1,
      titulo_oficial: 'X Semana Integrada da Computação',
      sigla: 'SIC',
      data_abertura_evento: ts('2026-10-10 08:00:00'),
      data_encerramento_evento: ts('2026-10-14 18:00:00'),
      endereco: 'UEMS Dourados - MS',
    },
  });
  await prisma.edicao.upsert({
    where: { id_edicao: 2 },
    update: {},
    create: {
      id_edicao: 2,
      id_evento: 2,
      titulo_oficial: 'V Semana de Enfermagem',
      sigla: 'SENF',
      data_abertura_evento: ts('2026-05-12 08:00:00'),
      data_encerramento_evento: ts('2026-05-16 18:00:00'),
      endereco: 'UEMS Dourados - MS',
    },
  });

  await prisma.espacoFisico.upsert({
    where: { id_espaco: 1 },
    update: {},
    create: {
      id_espaco: 1,
      id_edicao: 1,
      tipo_espaco: 'Laboratório',
      nome_sala: 'Lab de Redes e Linux',
      capacidade_max: 40,
    },
  });
  await prisma.espacoFisico.upsert({
    where: { id_espaco: 2 },
    update: {},
    create: {
      id_espaco: 2,
      id_edicao: 2,
      tipo_espaco: 'Anfiteatro',
      nome_sala: 'Anfiteatro Central',
      capacidade_max: 200,
    },
  });

  await prisma.itemInventarioFisico.upsert({
    where: { id_item: 1 },
    update: {},
    create: {
      id_item: 1,
      id_edicao: 1,
      tipo_item: 'Eletrônico',
      quantidade_total: 2,
      quantidade_disponivel: 1,
      quantidade_minima: 1,
      descricao: 'Projetor DataShow',
    },
  });
  await prisma.itemInventarioFisico.upsert({
    where: { id_item: 2 },
    update: {},
    create: {
      id_item: 2,
      id_edicao: 2,
      tipo_item: 'Material Prático',
      quantidade_total: 5,
      quantidade_disponivel: 5,
      quantidade_minima: 1,
      descricao: 'Maca para simulação de RCP',
    },
  });

  await prisma.registroInventario.upsert({
    where: { id_registro_item: 1 },
    update: {},
    create: {
      id_registro_item: 1,
      id_item: 1,
      id_organizador: 1,
      id_ministrante: 1,
      data_retirada: ts('2026-10-10 07:30:00'),
      status: 'Em uso',
      quantidade_retirada: 1,
    },
  });

  await prisma.grupoTrabalho.upsert({
    where: { id_grupo: 1 },
    update: {},
    create: {
      id_grupo: 1,
      id_edicao: 2,
      nome: 'Comissão de Acolhimento',
      sigla: 'CACOL',
    },
  });
  await prisma.perfilComissao.upsert({
    where: { id_comissao: 1 },
    update: {},
    create: {
      id_comissao: 1,
      id_grupo: 1,
      funcao_geral: 'Credenciamento de participantes',
    },
  });
  await prisma.turno.upsert({
    where: { id_turno: 1 },
    update: {},
    create: {
      id_turno: 1,
      id_comissao: 1,
      data_inicio_turno: ts('2026-05-12 07:00:00'),
      data_final_turno: ts('2026-05-12 12:00:00'),
      funcao_desempenhada: 'Check-in na porta do Anfiteatro',
    },
  });

  await prisma.atividade.upsert({
    where: { id_atividade: 1 },
    update: {},
    create: {
      id_atividade: 1,
      id_edicao: 1,
      titulo: 'Minicurso: Programação Competitiva em C++',
      tipo_atividade: 'Minicurso',
      carga_horario: 4,
      data_abertura_atividade: ts('2026-10-10 14:00:00'),
    },
  });
  await prisma.atividade.upsert({
    where: { id_atividade: 2 },
    update: {},
    create: {
      id_atividade: 2,
      id_edicao: 2,
      titulo: 'Workshop: Suporte Básico de Vida',
      tipo_atividade: 'Oficina',
      carga_horario: 4,
      data_abertura_atividade: ts('2026-05-13 09:00:00'),
    },
  });

  await prisma.atividadeMinistrante.upsert({
    where: { id_atividade_ministrante: 1 },
    update: {},
    create: { id_atividade_ministrante: 1, id_atividade: 1, id_ministrante: 1 },
  });
  await prisma.atividadeMinistrante.upsert({
    where: { id_atividade_ministrante: 2 },
    update: {},
    create: { id_atividade_ministrante: 2, id_atividade: 2, id_ministrante: 2 },
  });

  await prisma.reserva.upsert({
    where: { id_reserva: 1 },
    update: {},
    create: {
      id_reserva: 1,
      id_atividade: 1,
      id_espaco: 1,
      data_inicio: ts('2026-10-10 13:30:00'),
      data_final: ts('2026-10-10 17:30:00'),
    },
  });
  await prisma.reserva.upsert({
    where: { id_reserva: 2 },
    update: {},
    create: {
      id_reserva: 2,
      id_atividade: 2,
      id_espaco: 2,
      data_inicio: ts('2026-05-13 08:30:00'),
      data_final: ts('2026-05-13 12:30:00'),
    },
  });

  await prisma.materialDigital.upsert({
    where: { id_material: 1 },
    update: {},
    create: {
      id_material: 1,
      id_atividade: 1,
      titulo: 'Slides C++',
      url_pdf: 'links/slides_cpp.pdf',
    },
  });
  await prisma.comunicado.upsert({
    where: { id_comunicado: 1 },
    update: {},
    create: {
      id_comunicado: 1,
      id_edicao: 1,
      id_atividade: 1,
      titulo: 'Pré-requisito',
      conteudo: 'Tragam o ambiente Ubuntu configurado.',
    },
  });

  await prisma.loteIngresso.upsert({
    where: { id_lote: 1 },
    update: {},
    create: {
      id_lote: 1,
      id_edicao: 1,
      nome_lote: 'Lote Único Computação',
      preco: new Prisma.Decimal('20.00'),
      numero_max_ingressos: 100,
    },
  });
  await prisma.loteIngresso.upsert({
    where: { id_lote: 2 },
    update: {},
    create: {
      id_lote: 2,
      id_edicao: 2,
      nome_lote: 'Lote Único Enfermagem',
      preco: new Prisma.Decimal('25.00'),
      numero_max_ingressos: 100,
    },
  });

  await prisma.cupom.upsert({
    where: { id_cupom: 1 },
    update: {},
    create: {
      id_cupom: 1,
      id_edicao: 1,
      codigo: 'MONITORIA100',
      percentual_desconto: 100,
      limite_usos: 10,
      quantidade_uso: 1,
    },
  });

  await prisma.inscricaoEdicao.upsert({
    where: { id_inscricao_edicao: 1 },
    update: {},
    create: {
      id_inscricao_edicao: 1,
      id_participante: 1,
      id_cupom: 1,
      id_lote: 1,
      status: 'Confirmada',
    },
  });
  await prisma.inscricaoEdicao.upsert({
    where: { id_inscricao_edicao: 2 },
    update: {},
    create: {
      id_inscricao_edicao: 2,
      id_participante: 2,
      id_lote: 2,
      status: 'Confirmada',
    },
  });

  await prisma.pagamento.upsert({
    where: { id_pagamento: 1 },
    update: {},
    create: {
      id_pagamento: 1,
      id_inscricao_edicao: 1,
      status: 'Aprovado',
      valor: new Prisma.Decimal('0.00'),
      metodo_pagamento: 'Cupom Integral',
    },
  });
  await prisma.pagamento.upsert({
    where: { id_pagamento: 2 },
    update: {},
    create: {
      id_pagamento: 2,
      id_inscricao_edicao: 2,
      status: 'Aprovado',
      valor: new Prisma.Decimal('25.00'),
      metodo_pagamento: 'PIX',
    },
  });

  await prisma.inscricaoAtividade.upsert({
    where: { id_inscricao_atividade: 1 },
    update: {},
    create: {
      id_inscricao_atividade: 1,
      id_inscricao_edicao: 1,
      id_atividade: 1,
      status: 'Confirmada',
    },
  });
  await prisma.inscricaoAtividade.upsert({
    where: { id_inscricao_atividade: 2 },
    update: {},
    create: {
      id_inscricao_atividade: 2,
      id_inscricao_edicao: 2,
      id_atividade: 2,
      status: 'Confirmada',
    },
  });

  await prisma.presenca.upsert({
    where: { id_presenca: 1 },
    update: {},
    create: {
      id_presenca: 1,
      id_inscricao_atividade: 1,
      id_atividade: 1,
      status: 'Presente',
    },
  });
  await prisma.presenca.upsert({
    where: { id_presenca: 2 },
    update: {},
    create: {
      id_presenca: 2,
      id_inscricao_atividade: 2,
      id_atividade: 2,
      status: 'Presente',
    },
  });

  await prisma.anais.upsert({
    where: { id_anais: 1 },
    update: {},
    create: {
      id_anais: 1,
      id_edicao: 1,
      data_lancamento: ts('2026-11-01 00:00:00'),
    },
  });
  await prisma.trabalhoAcademico.upsert({
    where: { id_trabalho: 1 },
    update: {},
    create: {
      id_trabalho: 1,
      id_anais: 1,
      titulo: 'Arquitetura P2P e Kotlin para Gestão de Doação de Sangue',
      area_tematica: 'Engenharia de Software em Saúde',
    },
  });
  await prisma.submissao.upsert({
    where: { id_submissao: 1 },
    update: {},
    create: { id_submissao: 1, id_autor: 1, id_trabalho: 1 },
  });
  await prisma.avaliacao.upsert({
    where: { id_avaliacao: 1 },
    update: {},
    create: {
      id_avaliacao: 1,
      id_trabalho: 1,
      status: 'Aprovado',
      nota: new Prisma.Decimal('98.50'),
    },
  });
  await prisma.correcao.upsert({
    where: { id_correcao: 1 },
    update: {},
    create: { id_correcao: 1, id_parecerista: 1, id_avaliacao: 1 },
  });

  await prisma.modeloTrabalhoCientifico.upsert({
    where: { id_modelo: 1 },
    update: {},
    create: {
      id_modelo: 1,
      id_edicao: 1,
      url_modelo_template: 'docs/template_sbc.docx',
      numero_apresentadores: 2,
    },
  });
  await prisma.modeloCertificado.upsert({
    where: { id_modelo: 1 },
    update: {},
    create: {
      id_modelo: 1,
      id_edicao: 1,
      titulo: 'Certificado SIC',
      carga_horaria_minima: 75,
    },
  });
  await prisma.signatario.upsert({
    where: { id_signatario: 1 },
    update: {},
    create: {
      id_signatario: 1,
      id_edicao: 1,
      nome: 'Harrison Wells',
      cargo: 'Reitor',
    },
  });
  await prisma.signatario.upsert({
    where: { id_signatario: 2 },
    update: {},
    create: {
      id_signatario: 2,
      id_edicao: 2,
      nome: 'Amanda Collins',
      cargo: 'Diretora de Ciências da Saúde',
    },
  });

  await prisma.certificado.upsert({
    where: { id_certificado: 1 },
    update: {},
    create: {
      id_certificado: 1,
      id_edicao: 1,
      id_atividade: 1,
      id_usuario: 6,
      codigo_autenticidade: 'AUTH-8822-COMP',
    },
  });
  await prisma.certificado.upsert({
    where: { id_certificado: 2 },
    update: {},
    create: {
      id_certificado: 2,
      id_edicao: 2,
      id_atividade: 2,
      id_usuario: 7,
      codigo_autenticidade: 'AUTH-9933-ENF',
    },
  });

  await prisma.midiaEvento.upsert({
    where: { id_material: 1 },
    update: {},
    create: {
      id_material: 1,
      id_edicao: 1,
      url_material: 'img/banner_sic.png',
      descricao: 'Banner Principal',
    },
  });
  await prisma.midiaEvento.upsert({
    where: { id_material: 2 },
    update: {},
    create: {
      id_material: 2,
      id_edicao: 2,
      url_material: 'img/banner_enf.png',
      descricao: 'Banner Principal Enfermagem',
    },
  });

  await prisma.patrocinador.upsert({
    where: { id_patrocinador: 1 },
    update: {},
    create: {
      id_patrocinador: 1,
      id_edicao: 1,
      razao_social: 'Cosmos Cloud Hosting',
      nivel: 1,
    },
  });
  await prisma.patrocinador.upsert({
    where: { id_patrocinador: 2 },
    update: {},
    create: {
      id_patrocinador: 2,
      id_edicao: 2,
      razao_social: 'Hospital Regional',
      nivel: 1,
    },
  });

  await resetSequences();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
