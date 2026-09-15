-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "url_foto" TEXT,
    "token_recuperacao" VARCHAR(255),
    "validade_token_recuperacao" TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "notificacao" (
    "id_notificacao" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "data" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id_notificacao")
);

-- CreateTable
CREATE TABLE "perfil_usuario" (
    "id_perfil" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo_perfil" VARCHAR(100) NOT NULL,

    CONSTRAINT "perfil_usuario_pkey" PRIMARY KEY ("id_perfil")
);

-- CreateTable
CREATE TABLE "perfil_administrador" (
    "id_administrador" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "perfil_administrador_pkey" PRIMARY KEY ("id_administrador")
);

-- CreateTable
CREATE TABLE "perfil_organizador" (
    "id_organizador" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "perfil_organizador_pkey" PRIMARY KEY ("id_organizador")
);

-- CreateTable
CREATE TABLE "perfil_ministrante" (
    "id_ministrante" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "biografia" TEXT,
    "area_atuacao" VARCHAR(150),
    "instituicao_origem" VARCHAR(255),
    "url_foto" TEXT,

    CONSTRAINT "perfil_ministrante_pkey" PRIMARY KEY ("id_ministrante")
);

-- CreateTable
CREATE TABLE "perfil_participante" (
    "id_participante" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "perfil_participante_pkey" PRIMARY KEY ("id_participante")
);

-- CreateTable
CREATE TABLE "perfil_parecerista" (
    "id_parecerista" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "perfil_parecerista_pkey" PRIMARY KEY ("id_parecerista")
);

-- CreateTable
CREATE TABLE "perfil_autor" (
    "id_autor" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "perfil_autor_pkey" PRIMARY KEY ("id_autor")
);

-- CreateTable
CREATE TABLE "evento" (
    "id_evento" SERIAL NOT NULL,
    "id_organizador" INTEGER NOT NULL,
    "nome_marca" VARCHAR(255) NOT NULL,
    "descricao_geral" TEXT,

    CONSTRAINT "evento_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "edicao" (
    "id_edicao" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "titulo_oficial" VARCHAR(255) NOT NULL,
    "numero_edicao" VARCHAR(50),
    "sigla" VARCHAR(50),
    "unidade_promotora" VARCHAR(255),
    "area_tematica" VARCHAR(150),
    "descricao_geral" TEXT,
    "url_logotipo" TEXT,
    "publico_alvo" VARCHAR(255),
    "url_rede_social" TEXT,
    "url_site" TEXT,
    "data_abertura_evento" TIMESTAMP,
    "data_encerramento_evento" TIMESTAMP,
    "data_encerramento_submissoes" TIMESTAMP,
    "status_evento" VARCHAR(100) DEFAULT 'Ativo',
    "capacidade_max_participantes" INTEGER,
    "endereco" TEXT,

    CONSTRAINT "edicao_pkey" PRIMARY KEY ("id_edicao")
);

-- CreateTable
CREATE TABLE "grupo_trabalho" (
    "id_grupo" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "sigla" VARCHAR(50),

    CONSTRAINT "grupo_trabalho_pkey" PRIMARY KEY ("id_grupo")
);

-- CreateTable
CREATE TABLE "perfil_comissao" (
    "id_comissao" SERIAL NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    "funcao_geral" VARCHAR(255),

    CONSTRAINT "perfil_comissao_pkey" PRIMARY KEY ("id_comissao")
);

-- CreateTable
CREATE TABLE "turno" (
    "id_turno" SERIAL NOT NULL,
    "id_comissao" INTEGER NOT NULL,
    "data_inicio_turno" TIMESTAMP,
    "data_final_turno" TIMESTAMP,
    "funcao_desempenhada" VARCHAR(255),
    "presenca_confirmada" VARCHAR(50),

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id_turno")
);

-- CreateTable
CREATE TABLE "lote_ingresso" (
    "id_lote" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "nome_lote" VARCHAR(150) NOT NULL,
    "data_abertura_lote" TIMESTAMP,
    "data_encerramento_lote" TIMESTAMP,
    "preco" DECIMAL(10,2) NOT NULL,
    "numero_max_ingressos" INTEGER NOT NULL,

    CONSTRAINT "lote_ingresso_pkey" PRIMARY KEY ("id_lote")
);

-- CreateTable
CREATE TABLE "cupom" (
    "id_cupom" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "percentual_desconto" INTEGER NOT NULL,
    "limite_usos" INTEGER NOT NULL,
    "quantidade_uso" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cupom_pkey" PRIMARY KEY ("id_cupom")
);

-- CreateTable
CREATE TABLE "inscricao_edicao" (
    "id_inscricao_edicao" SERIAL NOT NULL,
    "id_participante" INTEGER NOT NULL,
    "id_cupom" INTEGER,
    "id_lote" INTEGER NOT NULL,
    "status" VARCHAR(100) NOT NULL DEFAULT 'Pendente',
    "url_qrcode" TEXT,

    CONSTRAINT "inscricao_edicao_pkey" PRIMARY KEY ("id_inscricao_edicao")
);

-- CreateTable
CREATE TABLE "pagamento" (
    "id_pagamento" SERIAL NOT NULL,
    "id_inscricao_edicao" INTEGER NOT NULL,
    "status" VARCHAR(100),
    "url_recibo" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_pagamento" TIMESTAMP,
    "gateway_id" VARCHAR(255),
    "metodo_pagamento" VARCHAR(100),

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("id_pagamento")
);

-- CreateTable
CREATE TABLE "atividade" (
    "id_atividade" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "tipo_atividade" VARCHAR(100),
    "descricao" TEXT,
    "carga_horario" INTEGER NOT NULL,
    "data_abertura_atividade" TIMESTAMP,
    "data_encerramento_atividade" TIMESTAMP,

    CONSTRAINT "atividade_pkey" PRIMARY KEY ("id_atividade")
);

-- CreateTable
CREATE TABLE "espaco_fisico" (
    "id_espaco" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "tipo_espaco" VARCHAR(100),
    "descricao_local" TEXT,
    "instituicao" VARCHAR(255),
    "nome_sala" VARCHAR(150),
    "capacidade_max" INTEGER NOT NULL,
    "descricao_recursos_disponiveis" TEXT,

    CONSTRAINT "espaco_fisico_pkey" PRIMARY KEY ("id_espaco")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id_reserva" SERIAL NOT NULL,
    "id_atividade" INTEGER NOT NULL,
    "id_espaco" INTEGER NOT NULL,
    "data_inicio" TIMESTAMP,
    "data_final" TIMESTAMP,

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateTable
CREATE TABLE "item_inventario_fisico" (
    "id_item" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "tipo_item" VARCHAR(100),
    "quantidade_total" INTEGER NOT NULL,
    "quantidade_disponivel" INTEGER NOT NULL,
    "quantidade_minima" INTEGER NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "item_inventario_fisico_pkey" PRIMARY KEY ("id_item")
);

-- CreateTable
CREATE TABLE "registro_inventario" (
    "id_registro_item" SERIAL NOT NULL,
    "id_item" INTEGER NOT NULL,
    "id_organizador" INTEGER NOT NULL,
    "id_ministrante" INTEGER,
    "data_retirada" TIMESTAMP NOT NULL,
    "data_entrega" TIMESTAMP,
    "status" VARCHAR(100),
    "quantidade_retirada" INTEGER NOT NULL,

    CONSTRAINT "registro_inventario_pkey" PRIMARY KEY ("id_registro_item")
);

-- CreateTable
CREATE TABLE "inscricao_atividade" (
    "id_inscricao_atividade" SERIAL NOT NULL,
    "id_inscricao_edicao" INTEGER NOT NULL,
    "id_atividade" INTEGER NOT NULL,
    "status" VARCHAR(100),

    CONSTRAINT "inscricao_atividade_pkey" PRIMARY KEY ("id_inscricao_atividade")
);

-- CreateTable
CREATE TABLE "presenca" (
    "id_presenca" SERIAL NOT NULL,
    "id_inscricao_atividade" INTEGER NOT NULL,
    "id_atividade" INTEGER NOT NULL,
    "data" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50),

    CONSTRAINT "presenca_pkey" PRIMARY KEY ("id_presenca")
);

-- CreateTable
CREATE TABLE "certificado" (
    "id_certificado" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "id_atividade" INTEGER,
    "id_usuario" INTEGER NOT NULL,
    "tipo_participacao" VARCHAR(100),
    "nome_atividade" VARCHAR(255),
    "codigo_autenticidade" VARCHAR(100),
    "carga_horaria_impressa" VARCHAR(50),

    CONSTRAINT "certificado_pkey" PRIMARY KEY ("id_certificado")
);

-- CreateTable
CREATE TABLE "atividade_ministrante" (
    "id_atividade_ministrante" SERIAL NOT NULL,
    "id_atividade" INTEGER NOT NULL,
    "id_ministrante" INTEGER NOT NULL,

    CONSTRAINT "atividade_ministrante_pkey" PRIMARY KEY ("id_atividade_ministrante")
);

-- CreateTable
CREATE TABLE "anais" (
    "id_anais" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "data_lancamento" TIMESTAMP,

    CONSTRAINT "anais_pkey" PRIMARY KEY ("id_anais")
);

-- CreateTable
CREATE TABLE "trabalho_academico" (
    "id_trabalho" SERIAL NOT NULL,
    "id_anais" INTEGER,
    "titulo" VARCHAR(255) NOT NULL,
    "area_tematica" VARCHAR(150),
    "url_arquivo_pdf" TEXT,
    "numero_apresentadores" INTEGER,

    CONSTRAINT "trabalho_academico_pkey" PRIMARY KEY ("id_trabalho")
);

-- CreateTable
CREATE TABLE "submissao" (
    "id_submissao" SERIAL NOT NULL,
    "id_autor" INTEGER NOT NULL,
    "id_trabalho" INTEGER NOT NULL,

    CONSTRAINT "submissao_pkey" PRIMARY KEY ("id_submissao")
);

-- CreateTable
CREATE TABLE "avaliacao" (
    "id_avaliacao" SERIAL NOT NULL,
    "id_trabalho" INTEGER NOT NULL,
    "status" VARCHAR(100),
    "descricao_parecer" TEXT,
    "nota" DECIMAL(5,2),
    "data_avaliacao" TIMESTAMP,
    "data_submissao" TIMESTAMP,
    "data_aprovacao" TIMESTAMP,

    CONSTRAINT "avaliacao_pkey" PRIMARY KEY ("id_avaliacao")
);

-- CreateTable
CREATE TABLE "correcao" (
    "id_correcao" SERIAL NOT NULL,
    "id_parecerista" INTEGER NOT NULL,
    "id_avaliacao" INTEGER NOT NULL,

    CONSTRAINT "correcao_pkey" PRIMARY KEY ("id_correcao")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_administrador_id_usuario_key" ON "perfil_administrador"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_organizador_id_usuario_key" ON "perfil_organizador"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_ministrante_id_usuario_key" ON "perfil_ministrante"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_participante_id_usuario_key" ON "perfil_participante"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_parecerista_id_usuario_key" ON "perfil_parecerista"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_autor_id_usuario_key" ON "perfil_autor"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "cupom_codigo_key" ON "cupom"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "certificado_codigo_autenticidade_key" ON "certificado"("codigo_autenticidade");

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_usuario" ADD CONSTRAINT "perfil_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_administrador" ADD CONSTRAINT "perfil_administrador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_organizador" ADD CONSTRAINT "perfil_organizador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_ministrante" ADD CONSTRAINT "perfil_ministrante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_participante" ADD CONSTRAINT "perfil_participante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_parecerista" ADD CONSTRAINT "perfil_parecerista_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_autor" ADD CONSTRAINT "perfil_autor_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_id_organizador_fkey" FOREIGN KEY ("id_organizador") REFERENCES "perfil_organizador"("id_organizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edicao" ADD CONSTRAINT "edicao_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "evento"("id_evento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_trabalho" ADD CONSTRAINT "grupo_trabalho_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_comissao" ADD CONSTRAINT "perfil_comissao_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupo_trabalho"("id_grupo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_id_comissao_fkey" FOREIGN KEY ("id_comissao") REFERENCES "perfil_comissao"("id_comissao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao_edicao" ADD CONSTRAINT "inscricao_edicao_id_participante_fkey" FOREIGN KEY ("id_participante") REFERENCES "perfil_participante"("id_participante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao_edicao" ADD CONSTRAINT "inscricao_edicao_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "lote_ingresso"("id_lote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao_edicao" ADD CONSTRAINT "inscricao_edicao_id_cupom_fkey" FOREIGN KEY ("id_cupom") REFERENCES "cupom"("id_cupom") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_id_inscricao_edicao_fkey" FOREIGN KEY ("id_inscricao_edicao") REFERENCES "inscricao_edicao"("id_inscricao_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_atividade_fkey" FOREIGN KEY ("id_atividade") REFERENCES "atividade"("id_atividade") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_espaco_fkey" FOREIGN KEY ("id_espaco") REFERENCES "espaco_fisico"("id_espaco") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_inventario" ADD CONSTRAINT "registro_inventario_id_item_fkey" FOREIGN KEY ("id_item") REFERENCES "item_inventario_fisico"("id_item") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_inventario" ADD CONSTRAINT "registro_inventario_id_ministrante_fkey" FOREIGN KEY ("id_ministrante") REFERENCES "perfil_ministrante"("id_ministrante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao_atividade" ADD CONSTRAINT "inscricao_atividade_id_inscricao_edicao_fkey" FOREIGN KEY ("id_inscricao_edicao") REFERENCES "inscricao_edicao"("id_inscricao_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao_atividade" ADD CONSTRAINT "inscricao_atividade_id_atividade_fkey" FOREIGN KEY ("id_atividade") REFERENCES "atividade"("id_atividade") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presenca" ADD CONSTRAINT "presenca_id_inscricao_atividade_fkey" FOREIGN KEY ("id_inscricao_atividade") REFERENCES "inscricao_atividade"("id_inscricao_atividade") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presenca" ADD CONSTRAINT "presenca_id_atividade_fkey" FOREIGN KEY ("id_atividade") REFERENCES "atividade"("id_atividade") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_ministrante" ADD CONSTRAINT "atividade_ministrante_id_atividade_fkey" FOREIGN KEY ("id_atividade") REFERENCES "atividade"("id_atividade") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_ministrante" ADD CONSTRAINT "atividade_ministrante_id_ministrante_fkey" FOREIGN KEY ("id_ministrante") REFERENCES "perfil_ministrante"("id_ministrante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabalho_academico" ADD CONSTRAINT "trabalho_academico_id_anais_fkey" FOREIGN KEY ("id_anais") REFERENCES "anais"("id_anais") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissao" ADD CONSTRAINT "submissao_id_autor_fkey" FOREIGN KEY ("id_autor") REFERENCES "perfil_autor"("id_autor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissao" ADD CONSTRAINT "submissao_id_trabalho_fkey" FOREIGN KEY ("id_trabalho") REFERENCES "trabalho_academico"("id_trabalho") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_id_trabalho_fkey" FOREIGN KEY ("id_trabalho") REFERENCES "trabalho_academico"("id_trabalho") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correcao" ADD CONSTRAINT "correcao_id_parecerista_fkey" FOREIGN KEY ("id_parecerista") REFERENCES "perfil_parecerista"("id_parecerista") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correcao" ADD CONSTRAINT "correcao_id_avaliacao_fkey" FOREIGN KEY ("id_avaliacao") REFERENCES "avaliacao"("id_avaliacao") ON DELETE CASCADE ON UPDATE CASCADE;

