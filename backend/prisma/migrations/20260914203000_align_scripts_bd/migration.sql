-- CreateTable
CREATE TABLE "material_digital" (
    "id_material" SERIAL NOT NULL,
    "id_atividade" INTEGER NOT NULL,
    "titulo" VARCHAR(255),
    "url_pdf" TEXT,
    "data" TIMESTAMP,
    "status" VARCHAR(100),

    CONSTRAINT "material_digital_pkey" PRIMARY KEY ("id_material")
);

-- CreateTable
CREATE TABLE "comunicado" (
    "id_comunicado" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "id_atividade" INTEGER,
    "titulo" VARCHAR(255) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "data_envio" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "perfil_alvo" VARCHAR(100),

    CONSTRAINT "comunicado_pkey" PRIMARY KEY ("id_comunicado")
);

-- CreateTable
CREATE TABLE "midia_evento" (
    "id_material" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "url_material" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "midia_evento_pkey" PRIMARY KEY ("id_material")
);

-- CreateTable
CREATE TABLE "patrocinador" (
    "id_patrocinador" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "razao_social" VARCHAR(255) NOT NULL,
    "url_logo" TEXT,
    "descricao" TEXT,
    "nivel" INTEGER,

    CONSTRAINT "patrocinador_pkey" PRIMARY KEY ("id_patrocinador")
);

-- CreateTable
CREATE TABLE "modelo_trabalho_cientifico" (
    "id_modelo" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "url_modelo_template" TEXT NOT NULL,
    "numero_apresentadores" INTEGER,

    CONSTRAINT "modelo_trabalho_cientifico_pkey" PRIMARY KEY ("id_modelo")
);

-- CreateTable
CREATE TABLE "modelo_certificado" (
    "id_modelo" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "titulo" VARCHAR(255),
    "url_fundo_template" TEXT,
    "texto_institucional" TEXT,
    "url_assinatura" TEXT,
    "carga_horaria_minima" INTEGER,

    CONSTRAINT "modelo_certificado_pkey" PRIMARY KEY ("id_modelo")
);

-- CreateTable
CREATE TABLE "signatario" (
    "id_signatario" SERIAL NOT NULL,
    "id_edicao" INTEGER NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cargo" VARCHAR(150),
    "url_imagem_assinatura" TEXT,

    CONSTRAINT "signatario_pkey" PRIMARY KEY ("id_signatario")
);

-- AddForeignKey
ALTER TABLE "lote_ingresso" ADD CONSTRAINT "lote_ingresso_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupom" ADD CONSTRAINT "cupom_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade" ADD CONSTRAINT "atividade_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "espaco_fisico" ADD CONSTRAINT "espaco_fisico_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_inventario_fisico" ADD CONSTRAINT "item_inventario_fisico_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_inventario" ADD CONSTRAINT "registro_inventario_id_organizador_fkey" FOREIGN KEY ("id_organizador") REFERENCES "perfil_organizador"("id_organizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_id_atividade_fkey" FOREIGN KEY ("id_atividade") REFERENCES "atividade"("id_atividade") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anais" ADD CONSTRAINT "anais_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_digital" ADD CONSTRAINT "material_digital_id_atividade_fkey" FOREIGN KEY ("id_atividade") REFERENCES "atividade"("id_atividade") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado" ADD CONSTRAINT "comunicado_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado" ADD CONSTRAINT "comunicado_id_atividade_fkey" FOREIGN KEY ("id_atividade") REFERENCES "atividade"("id_atividade") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "midia_evento" ADD CONSTRAINT "midia_evento_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrocinador" ADD CONSTRAINT "patrocinador_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelo_trabalho_cientifico" ADD CONSTRAINT "modelo_trabalho_cientifico_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelo_certificado" ADD CONSTRAINT "modelo_certificado_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatario" ADD CONSTRAINT "signatario_id_edicao_fkey" FOREIGN KEY ("id_edicao") REFERENCES "edicao"("id_edicao") ON DELETE CASCADE ON UPDATE CASCADE;

-- Adapted stored functions from ScriptsBD/script_procedure.sql
-- INTEGER PKs, RETURNS the inserted row, no internal COMMIT (safe inside Prisma $transaction).

CREATE OR REPLACE FUNCTION sp_retirar_inventario(
    p_id_item INTEGER,
    p_id_organizador INTEGER,
    p_quantidade INTEGER,
    p_id_ministrante INTEGER DEFAULT NULL
)
RETURNS SETOF registro_inventario
LANGUAGE plpgsql
AS $$
DECLARE
    v_disponivel INTEGER;
BEGIN
    SELECT quantidade_disponivel INTO v_disponivel
    FROM item_inventario_fisico
    WHERE id_item = p_id_item
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Erro: Item de inventario nao encontrado.';
    END IF;

    IF v_disponivel < p_quantidade THEN
        RAISE EXCEPTION 'Erro: Quantidade solicitada e maior que o estoque disponivel.';
    END IF;

    UPDATE item_inventario_fisico
    SET quantidade_disponivel = quantidade_disponivel - p_quantidade
    WHERE id_item = p_id_item;

    RETURN QUERY
    INSERT INTO registro_inventario (
        id_item,
        id_organizador,
        id_ministrante,
        data_retirada,
        status,
        quantidade_retirada
    )
    VALUES (
        p_id_item,
        p_id_organizador,
        p_id_ministrante,
        CURRENT_TIMESTAMP,
        'Retirado',
        p_quantidade
    )
    RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION sp_reservar_espaco(
    p_id_atividade INTEGER,
    p_id_espaco INTEGER,
    p_data_inicio TIMESTAMP,
    p_data_final TIMESTAMP
)
RETURNS SETOF reserva
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflitos INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_conflitos
    FROM reserva
    WHERE id_espaco = p_id_espaco
      AND data_inicio IS NOT NULL
      AND data_final IS NOT NULL
      AND (p_data_inicio < data_final AND p_data_final > data_inicio);

    IF v_conflitos > 0 THEN
        RAISE EXCEPTION 'Erro: O espaco fisico ja possui uma reserva conflitante neste horario.';
    END IF;

    RETURN QUERY
    INSERT INTO reserva (id_atividade, id_espaco, data_inicio, data_final)
    VALUES (p_id_atividade, p_id_espaco, p_data_inicio, p_data_final)
    RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION sp_realizar_inscricao_edicao(
    p_id_participante INTEGER,
    p_id_lote INTEGER,
    p_id_cupom INTEGER DEFAULT NULL
)
RETURNS SETOF inscricao_edicao
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_ingressos INTEGER;
    v_vendidos INTEGER;
    v_limite_usos_cupom INTEGER;
    v_usos_atuais_cupom INTEGER;
BEGIN
    SELECT numero_max_ingressos INTO v_max_ingressos
    FROM lote_ingresso
    WHERE id_lote = p_id_lote
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Erro: Lote de ingresso nao encontrado.';
    END IF;

    SELECT COUNT(*) INTO v_vendidos
    FROM inscricao_edicao
    WHERE id_lote = p_id_lote
      AND status <> 'Cancelada';

    IF v_vendidos >= v_max_ingressos THEN
        RAISE EXCEPTION 'Erro: Este lote de ingressos ja esta esgotado.';
    END IF;

    IF p_id_cupom IS NOT NULL THEN
        SELECT limite_usos, quantidade_uso
        INTO v_limite_usos_cupom, v_usos_atuais_cupom
        FROM cupom
        WHERE id_cupom = p_id_cupom
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Erro: Cupom invalido ou nao encontrado.';
        END IF;

        IF v_usos_atuais_cupom >= v_limite_usos_cupom THEN
            RAISE EXCEPTION 'Erro: O limite de uso deste cupom ja foi atingido.';
        END IF;

        UPDATE cupom
        SET quantidade_uso = quantidade_uso + 1
        WHERE id_cupom = p_id_cupom;
    END IF;

    RETURN QUERY
    INSERT INTO inscricao_edicao (id_participante, id_cupom, id_lote, status)
    VALUES (p_id_participante, p_id_cupom, p_id_lote, 'Pendente')
    RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION sp_registrar_avaliacao_trabalho(
    p_id_parecerista INTEGER,
    p_id_trabalho INTEGER,
    p_status VARCHAR(100),
    p_parecer TEXT,
    p_nota NUMERIC
)
RETURNS TABLE (
    id_avaliacao INTEGER,
    id_trabalho INTEGER,
    status VARCHAR(100),
    descricao_parecer TEXT,
    nota NUMERIC(5, 2),
    data_avaliacao TIMESTAMP,
    data_submissao TIMESTAMP,
    data_aprovacao TIMESTAMP,
    id_correcao INTEGER,
    id_parecerista INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_avaliacao INTEGER;
    v_id_correcao INTEGER;
BEGIN
    INSERT INTO avaliacao (id_trabalho, status, descricao_parecer, nota, data_avaliacao)
    VALUES (p_id_trabalho, p_status, p_parecer, p_nota, CURRENT_TIMESTAMP)
    RETURNING avaliacao.id_avaliacao INTO v_id_avaliacao;

    INSERT INTO correcao (id_parecerista, id_avaliacao)
    VALUES (p_id_parecerista, v_id_avaliacao)
    RETURNING correcao.id_correcao INTO v_id_correcao;

    RETURN QUERY
    SELECT
        a.id_avaliacao,
        a.id_trabalho,
        a.status,
        a.descricao_parecer,
        a.nota,
        a.data_avaliacao,
        a.data_submissao,
        a.data_aprovacao,
        v_id_correcao,
        p_id_parecerista
    FROM avaliacao a
    WHERE a.id_avaliacao = v_id_avaliacao;
END;
$$;

CREATE OR REPLACE FUNCTION sp_emitir_certificado_atividade(
    p_id_edicao INTEGER,
    p_id_atividade INTEGER,
    p_id_usuario INTEGER,
    p_codigo_autenticidade VARCHAR(100)
)
RETURNS SETOF certificado
LANGUAGE plpgsql
AS $$
DECLARE
    v_status_presenca VARCHAR(50);
    v_nome_atividade VARCHAR(255);
BEGIN
    SELECT titulo INTO v_nome_atividade
    FROM atividade
    WHERE id_atividade = p_id_atividade;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Erro: Atividade nao encontrada.';
    END IF;

    SELECT p.status INTO v_status_presenca
    FROM presenca p
    JOIN inscricao_atividade ia ON p.id_inscricao_atividade = ia.id_inscricao_atividade
    JOIN inscricao_edicao ie ON ia.id_inscricao_edicao = ie.id_inscricao_edicao
    JOIN perfil_participante pp ON ie.id_participante = pp.id_participante
    WHERE p.id_atividade = p_id_atividade
      AND pp.id_usuario = p_id_usuario
    LIMIT 1;

    IF v_status_presenca IS NULL OR v_status_presenca NOT IN ('Confirmada', 'Presente') THEN
        RAISE EXCEPTION 'Erro: O participante nao atingiu a frequencia necessaria para certificacao.';
    END IF;

    RETURN QUERY
    INSERT INTO certificado (
        id_edicao,
        id_atividade,
        id_usuario,
        tipo_participacao,
        nome_atividade,
        codigo_autenticidade
    )
    VALUES (
        p_id_edicao,
        p_id_atividade,
        p_id_usuario,
        'Participante',
        v_nome_atividade,
        p_codigo_autenticidade
    )
    RETURNING *;
END;
$$;
