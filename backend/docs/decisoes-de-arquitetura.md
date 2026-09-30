# Decisões de Arquitetura — Backend AcadEvent

Versão: 1.0  
Data: 2026-09-30  
Autor: Sizenando França (SBE)  
Revisores: José Carlos da Silva Filho (SPM)

---

A formatação deste documento segue o [padrão de documentação do projeto](../../docs/padrao-de-documentacao.md).  
Para decisões complementares, consulte: [Segurança](./decisoes-de-seguranca.md), [Banco e Concorrência](./decisoes-de-banco-e-concorrencia.md), [Contratos de API](./decisoes-de-api.md) e [Decisões por Módulo](./decisoes-dos-modulos.md).

## 1. Visão Geral e Princípios Arquiteturais

O backend do **AcadEvent** foi concebido sobre o runtime **Node.js 22 LTS**, utilizando o framework **NestJS 11** com **TypeScript 5** e persistência relacional através do **Prisma ORM 6** sobre **PostgreSQL 17**.

As decisões de engenharia priorizam:

- **Alta Coesão e Baixo Acoplamento:** Isolamento de regras de negócio por domínio.
- **Segurança por Padrão (Secure by Default):** Falha imediata na ausência de configuração, validação estrita de entrada e controle de acesso baseado em papéis (RBAC).
- **Consistência Transacional:** Operações críticas delegadas a transações atômicas e rotinas de banco com bloqueio pessimista.
- **Portabilidade de Infraestrutura:** Uso de padrões de projeto (Adapters) para componentes de I/O externo (como armazenamento de arquivos e logs).

---

## 2. Estrutura de Pacotes: _Package by Feature_

O projeto adota o padrão **Package by Feature** (Fatiamento Vertical), onde cada diretório em `src/` encapsula todas as preocupações relativas a uma capacidade de negócio ou subsistema:

```text
backend/src/
├── app.module.ts              # Módulo raiz orquestrador
├── main.ts                   # Bootstrap da aplicação, Swagger, CORS e Pipes globais
├── auth/                     # RF02/RNF03: Autenticação, estratégias JWT, RBAC e guards
├── eventos/                  # RF01: Gestão de eventos, edições e máquina de estados
├── espacos/                  # RF07: Gestão e reserva de espaços físicos
├── atividades/               # RF03/RF05: Gestão de atividades, cronograma e chamada
├── inscricoes/               # RF04: Lotes, cupons, inscrições e credenciamento QR Code
├── pagamentos/               # RF08: Confirmação manual, webhooks e relatórios financeiros
├── certificados/             # RF11/RF11.5: Emissão e motor gráfico de PDF (PDFKit)
├── storage/                  # RF10/RNF05.4: Padrão Adapter para upload/download de arquivos
├── comunicacao/              # RF09: Notificações em lote e comunicados da edição
├── inventario/               # RF12: Controle de itens físicos e retiradas
├── submissoes/               # RF06: Avaliações de trabalhos e blind review
├── logs/                     # RF16: Auditoria, interceptor mutatório e buffer circular
└── prisma/                   # Camada de persistência, conexão com banco e procedures
```

### Justificativa da Escolha

Ao contrário da arquitetura em camadas horizontais puras (onde controllers, services e repositórios ficam em pastas globais separadas), o _Package by Feature_:

1. Facilita o desenvolvimento paralelo entre múltiplos squads sem colisões frequentes de merge.
2. Torna clara a fronteira de domínio de cada módulo.
3. Permite a refatoração ou extração de módulos para microsserviços no futuro, caso a escala exija.

---

## 3. Camadas e Responsabilidades Internas

Cada módulo de negócio opera sob divisão de responsabilidades estrita:

| Camada                        | Componente NestJS                     | Responsabilidade Principal                                                                                                                                     |
| ----------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apresentação / Transporte** | `*.controller.ts`                     | Roteamento HTTP, extração de parâmetros, documentação OpenAPI (`@ApiOperation`, `@ApiTags`), aplicação de Guards e Pipes. Não contém regras de negócio.        |
| **Validação de Entrada**      | `dto/*.dto.ts`                        | Contratos tipados de entrada validados via decorators do `class-validator` e tipados com `class-transformer`.                                                  |
| **Domínio / Aplicação**       | `*.service.ts`                        | Regras de negócio, validações de integridade, orquestração de transações e regras de autorização fina (ex.: verificação de propriedade/IDOR).                  |
| **Segurança Transversal**     | `guards/`, `decorators/`              | Controle de autenticação (`JwtAuthGuard`), autorização de papéis (`RolesGuard`), extração de identidade (`@CurrentUser()`) e restrição de acesso (`@Roles()`). |
| **Observabilidade**           | `interceptors/`                       | Interceptação de tráfego mutatório e despacho assíncrono de telemetria (`LoggingInterceptor`).                                                                 |
| **Persistência Relacional**   | `prisma.service.ts` / `procedures.ts` | Comunicação com o PostgreSQL via Prisma Client ou execução de stored procedures via `$queryRaw`.                                                               |

---

## 4. Inversão de Dependência e Padrão Adapter no Storage

O módulo `storage` (RF10 e RNF05.4) adota o padrão de projeto **Adapter** (Port & Adapter) para abstrair o mecanismo físico de armazenamento de arquivos.

### Implementação:

1. **Contrato Abstrato (`storage.interface.ts`):**
   ```typescript
   export abstract class StorageServiceBase {
     abstract salvarArquivo(
       file: ArquivoUpload,
       subpasta?: string,
     ): Promise<{
       nome_salvo: string;
       url: string;
       tamanho: number;
       mimetype: string;
     }>;
     abstract removerArquivo(nome: string, subpasta?: string): Promise<boolean>;
   }
   ```
2. **Provedor Desacoplado no Módulo (`storage.module.ts`):**
   ```typescript
   @Module({
     providers: [
       {
         provide: STORAGE_SERVICE,
         useClass: LocalStorageService,
       },
     ],
     exports: [STORAGE_SERVICE],
   })
   export class StorageModule {}
   ```

### Decisão de Projeto:

- **Marco P3:** Implementação com `LocalStorageService`, gravando arquivos no disco local com nomes criptográficos baseados em timestamp e UUID/hashes, organizados em subpastas (`uploads/geral`, `uploads/submissoes`, etc.).
- **Evolução Futura:** A interface desacoplada permite criar um `S3StorageService` (AWS S3) ou `GCSStorageService` (Google Cloud Storage) e simplesmente alterar o binding no `storage.module.ts`, sem que nenhum controller ou serviço consumidor sofra alterações de código.

---

## 5. Estratégia de Auditoria e Logs de Operação (RF16)

O requisito de auditoria exige rastreabilidade completa das operações realizadas no sistema por administradores e organizadores.

### Arquitetura de Interceptação:

- **`LoggingInterceptor`:** Registrado globalmente no `AppModule`, atua exclusivamente sobre requisições com métodos mutatórios (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Não-bloqueio de I/O:** O registro de auditoria é delegado ao método `registrarAssincrono` do `LogsService`, que executa sob `setImmediate()`, garantindo que o tempo de resposta da API para o cliente final não seja degradado pelo log.
- **Captura de Contexto:** São gravados IP de origem, rota, método, código de status HTTP final, tempo total de resposta em milissegundos e ID do usuário autenticado (extraído do token JWT).

### Decisão de Armazenamento e Transição entre Marcos:

- **Marco P3 (Buffer Circular em Memória):**
  - O `LogsService` mantém uma fila em memória com capacidade máxima de 500 registros (`unshift` + `pop`).
  - **Motivação:** Prototipação rápida e validação de contratos no Marco P3 sem dependência imediata de provisionamento de novos bancos de dados NoSQL nos ambientes locais e de CI.
- **Marco P4 (Persistência Externa NoSQL):**
  - Transição acordada no PR #44 para desacoplar o `LogsService` via Adapter e persistir os registros em banco NoSQL orientado a documentos ou time-series (MongoDB ou Redis Stream/Document).
  - Consulta administrativa (`GET /admin/logs`) protegida por RBAC (`@Roles('administrador')`).

---

## 6. Ciclo de Vida da Aplicação e Conexões de Banco de Dados

A persistência utiliza o driver `@prisma/adapter-pg` integrado ao pool do `node-postgres` (`pg.Pool`).

### Problema Identificado:

Em ambientes de desenvolvimento, execução contínua de suítes de teste Jest e reinicializações automáticas (watch mode), conexões ativas com o PostgreSQL podiam ficar órfãs, esgotando o limite de conexões simultâneas do SGBD (`too many clients already`).

### Decisão Implementada:

O `PrismaService` implementa `OnModuleInit` e `OnModuleDestroy`:

```typescript
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL || '...';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool, { disposeExternalPool: true });
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (!this.pool.ending && !this.pool.ended) {
      await this.pool.end();
    }
  }
}
```

Isso garante encerramento gracioso (_graceful shutdown_) do pool de conexões tanto no shutdown da aplicação quanto no encerramento de testes e2e.

---

## 7. Estratégia de Tratamento de Erros e Exceções

O backend não permite vazamento de _stack traces_ não tratados para as respostas HTTP.

1. **Exceções Semânticas do NestJS:** Todo erro de validação ou regra de negócio é transformado em subclasse de `HttpException`:
   - `400 Bad Request`: Dados inválidos, violação de regras temporais, limite de vagas.
   - `401 Unauthorized`: Token JWT ausente, expirado ou segredo de webhook inválido.
   - `403 Forbidden`: Papel insuficiente no RBAC, IDOR detectado ou conflito de interesses.
   - `404 Not Found`: Entidade inexistente.
   - `409 Conflict`: Conflito de horários de atividade ou duplicidade de certificado.
2. **Mapeamento de Procedures SQL (`map-procedure-error.ts`):** Erros gerados com `RAISE EXCEPTION` em rotinas PostgreSQL são capturados e mapeados para exceções HTTP correspondentes com mensagens claras em português.
