# Decisões de Banco de Dados e Concorrência — Backend AcadEvent

Versão: 1.0  
Data: 2026-09-30  
Autor: Sizenando França (SBE)  
Revisores: José Carlos da Silva Filho (SPM)

---

A formatação deste documento segue o [padrão de documentação do projeto](../../docs/padrao-de-documentacao.md).  
Para decisões complementares, consulte: [Arquitetura](./decisoes-de-arquitetura.md), [Segurança](./decisoes-de-seguranca.md), [Contratos de API](./decisoes-de-api.md) e [Decisões por Módulo](./decisoes-dos-modulos.md).

## 1. Visão Geral de Persistência

A camada de persistência do **AcadEvent** é estruturada sobre o **PostgreSQL 17** utilizando o **Prisma ORM 6** como abstração de mapeamento objeto-relacional e executor de consultas.

O modelo de dados compreende **39 tabelas relacionais** normalizadas, integradas a Stored Procedures nativas no banco para operações atômicas de alta concorrência.

---

## 2. Padrão de Execução e Prevenção de SQL Injection

Todas as interações com o banco de dados seguem padrões estritos de parametrização:

1. **Prisma Client NATIVO:** Consultas orientadas a métodos (`findUnique`, `findFirst`, `findMany`, `create`, `update`, `delete`, `groupBy`, `aggregate`) utilizam internamente o motor do Prisma com binds de parâmetros imutáveis.
2. **Execução de Stored Procedures (`procedures.ts`):**
   - As chamadas às rotinas PostgreSQL são realizadas através do método `$queryRaw` com tagged templates.
   - O Prisma automaticamente converte interpolações (`${p_id_lote}`) em parâmetros posicionais seguros no PostgreSQL (`$1, $2, ...`), descartando qualquer concatenação de strings e eliminando riscos de SQL Injection.

---

## 3. Concorrência e Bloqueios Pessimistas (_Pessimistic Locking_)

Em cenários de alta concorrência — como abertura de lotes de ingressos limitados, reservas simultâneas de auditórios ou baixas de equipamentos no inventário —, validações otimistas baseadas em contagens assíncronas no Node.js estão sujeitas a condições de corrida (_Race Conditions_) e sobreposição (_Overbooking_).

Para garantir serialização estrita, foram implementados bloqueios pessimistas a nível de linha (**`FOR UPDATE`**) no PostgreSQL.

### 3.1 Venda de Ingressos por Lote (`sp_realizar_inscricao_edicao`)

- **Mecanismo:**
  ```sql
  SELECT quantidade_disponivel, id_edicao
  INTO v_qtd_disponivel, v_id_edicao
  FROM lote_ingresso
  WHERE id_lote = p_id_lote
  FOR UPDATE;
  ```
- **Garantia:** A linha do lote permanece bloqueada para escrita por outras transações concorrentes até o `COMMIT`. Se a quantidade disponível for zero, a procedure aborta com `RAISE EXCEPTION`, impedindo que mais ingressos sejam vendidos do que o limite estipulado.

### 3.2 Reserva de Espaços Físicos (`sp_reservar_espaco`)

- **Ameaça Mitigada:** Duas atividades reservando a mesma sala de aula ou auditório para horários sobrepostos quando submetidas no mesmo milissegundo.
- **Implementação:**

  ```sql
  -- Bloqueio pessimista no espaço físico alvo
  PERFORM 1 FROM espaco_fisico WHERE id_espaco = p_id_espaco FOR UPDATE;

  -- Verificação de colisão temporal
  IF EXISTS (
      SELECT 1 FROM reserva_espaco
      WHERE id_espaco = p_id_espaco
        AND data_inicio < p_data_final
        AND data_final > p_data_inicio
  ) THEN
      RAISE EXCEPTION 'Conflito de horario: Espaco fisico ja reservado neste intervalo.';
  END IF;
  ```

### 3.3 Baixa de Itens no Inventário (`sp_retirar_inventario`)

- **Implementação:**

  ```sql
  SELECT quantidade_disponivel
  INTO v_qtd_atual
  FROM item_inventario_fisico
  WHERE id_item = p_id_item
  FOR UPDATE;

  IF v_qtd_atual < p_quantidade THEN
      RAISE EXCEPTION 'Quantidade solicitada excede o estoque disponivel.';
  END IF;
  ```

- **Garantia:** Impede concorrência com débito duplicado e anula o risco de estoque negativo.

---

## 4. Atomicidade Transacional (`prisma.$transaction`)

Todas as operações mutatórias que envolvem múltiplas tabelas ou estados interdependentes são obrigatoriamente envolvidas no wrapper transacional do Prisma:

1. **Criação de Marca e Edição Inicial (`eventos.service.ts`):**
   - Criação do perfil de organizador (se inexistente), criação da entidade `Evento` (marca) e criação da primeira `Edicao` ocorrem na mesma transação atômica. Se qualquer campo falhar, o evento inteiro sofre rollback.
2. **Inscrição em Atividades com Limite de Capacidade (`atividades.service.ts`):**
   - A contagem de inscritos ativos (`tx.inscricaoAtividade.count`) e a criação da inscrição (`tx.inscricaoAtividade.create`) são executadas dentro da mesma transação, verificando a capacidade máxima do espaço físico vinculado (`reservaAtual.espaco.capacidade_max`).
3. **Inscrições Gratuitas (Cupom 100%):**
   - Inscrição via procedure, geração do hash do QR Code (`crypto.randomBytes(16)`), atualização do status para `'Confirmada'` e criação do pagamento como `'Aprovado'` com valor R$ 0,00 ocorrem atomicamente.
4. **Confirmação Manual de Balcão (`pagamentos.service.ts`):**
   - A confirmação da inscrição e a geração do recibo financeiro com código rastreável (`REC-...`) são gravadas na mesma transação.
5. **Transições de Webhook de Pagamento:**
   - Atualização do status do pagamento e alteração correspondente no status da inscrição (`Confirmada`, `Cancelada` ou `Estornada`) ocorrem de forma atômica.
6. **Devolução e Retirada de Inventário (`inventario.service.ts`):**
   - Na devolução de itens (`devolverItem`), executa-se transação com `tx.registroInventario.updateMany` condicional filtrando `status: 'Retirado'`. Se `count === 0` (o item já foi devolvido concorrentemente), a transação é abortada com `BadRequestException`. Caso contrário, a quantidade devolvida é incrementada atomicamente no `ItemInventarioFisico` (`increment: registro.quantidade_retirada`), eliminando o risco de devolução duplicada (_Double Return_) e inflação indevida de estoque.

---

## 5. Validação de Vínculos Relacionais entre Edições

Para evitar inconsistências semânticas e vazamentos de escopo entre diferentes edições e eventos (Achado 3.2 do Code Review):

- **Espaço Físico vs. Atividade:** O serviço `EspacosService` valida estritamente se `espaco.id_edicao === atividade.id_edicao` antes de invocar a procedure de reserva.
- **Cupom vs. Lote de Ingresso:** O serviço `InscricoesService` valida se `cupom.id_edicao === lote.id_edicao`, impedindo que cupons promocionais criados para o Evento A sejam aplicados em lotes de ingressos do Evento B.
- **Conflito de Grade Horária do Participante:** O serviço `AtividadesService` inspeciona a grade horária das atividades prévias do participante na mesma edição e rejeita inscrições em atividades com horários sobrepostos (`reservaAtual.data_inicio < res.data_final && reservaAtual.data_final > res.data_inicio`).

---

## 6. Otimização de Performance e Prevenção de OOM (Issue #40)

### Problema Identificado:

Em versões preliminares, relatórios financeiros e consultas de contagem carregavam coleções completas de objetos para a memória do Node.js através de `findMany({ include: { ... } })`, realizando filtros e somas via `.filter()` e `.reduce()` em JavaScript. Em edições com dezenas de milhares de inscritos, esse padrão causaria alto consumo de memória e falha por esgotamento de heap (**Out of Memory - OOM**).

### Solução Adotada (`pagamentos.service.ts`):

Delegação integral dos cálculos estatísticos para os mecanismos de agregação nativos do PostgreSQL via Prisma:

```typescript
const [contagemStatus, somaAprovados, somaPendentes] = await Promise.all([
  this.prisma.inscricaoEdicao.groupBy({
    by: ['status'],
    where: { lote: { id_edicao: idEdicao } },
    _count: { _all: true },
  }),
  this.prisma.pagamento.aggregate({
    _sum: { valor: true },
    where: {
      status: 'Aprovado',
      inscricao: { lote: { id_edicao: idEdicao } },
    },
  }),
  this.prisma.pagamento.aggregate({
    _sum: { valor: true },
    where: {
      status: 'Pendente',
      inscricao: { lote: { id_edicao: idEdicao } },
    },
  }),
]);
```

### Eliminação de Queries N+1:

No módulo de comunicação (`comunicacao.service.ts`), a emissão de comunicados para todos os participantes de uma edição ou atividade substituiu inserções individuais em laço (`for ... await create`) pela operação em lote **`prisma.notificacao.createMany({ data: idsUsuarios.map(...) })`**, reduzindo centenas de viagens de rede (_round-trips_) ao banco a uma única instrução SQL multi-row.

---

## 7. Ciclo de Vida do Pool de Conexões

O backend utiliza o driver `@prisma/adapter-pg` sobre uma instância gerenciada de `pg.Pool`.

- **Bootstrap:** `onModuleInit` realiza o `$connect()`.
- **Desligamento Seguro:** `onModuleDestroy` executa `$disconnect()` e invoca explicitamente `this.pool.end()`, prevenindo que testes automatizados deixem conexões abertas no PostgreSQL local ou nos containers de CI.
