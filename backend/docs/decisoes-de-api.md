# Decisões de API REST, Contratos e Integração — Backend AcadEvent

Versão: 1.0  
Data: 2026-09-30  
Autor: Sizenando França (SBE), Henrique Gettner de Oliveira (SPR)  
Revisores: José Carlos da Silva Filho (SPM)

---

A formatação deste documento segue o [padrão de documentação do projeto](../../docs/padrao-de-documentacao.md).  
Para decisões complementares, consulte: [Arquitetura](./decisoes-de-arquitetura.md), [Segurança](./decisoes-de-seguranca.md), [Banco e Concorrência](./decisoes-de-banco-e-concorrencia.md) e [Decisões por Módulo](./decisoes-dos-modulos.md).

## 1. Visão Geral

A camada de interface externa do backend do **AcadEvent** adota o estilo arquitetural **RESTful**, expondo contratos JSON tipados, padronização semântica de verbos e status codes HTTP, e documentação viva através da especificação **OpenAPI 3.0 / Swagger**.

---

## 2. Padrões de Verbos e Códigos de Status HTTP

As respostas da API obedecem à semântica estrita dos protocolos HTTP:

| Verbo HTTP | Finalidade                                                                        | Status Code Padrão de Sucesso |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------- |
| `GET`      | Consultas de leitura idempotentes, listagens e downloads de arquivos.             | `200 OK`                      |
| `POST`     | Criação de entidades, cadastro, autenticação, disparos de ação e webhooks.        | `201 Created`                 |
| `PATCH`    | Alterações parciais de estado em entidades existentes (ex.: transição de status). | `200 OK`                      |
| `DELETE`   | Exclusão lógica ou física de recursos.                                            | `200 OK`                      |

### Tratamento de Falhas e Erros Padronizados:

- **`400 Bad Request`:** Payload inválido, falha de validação nos DTOs, violação de regras temporais de eventos ou transição de estado não permitida.
- **`401 Unauthorized`:** Token JWT ausente, inválido ou expirado; segredo de webhook ausente ou incorreto.
- **`403 Forbidden`:** Usuário autenticado sem permissão suficiente na matriz RBAC, violação de IDOR ou conflito de interesses (_blind review_).
- **`404 Not Found`:** Entidade não localizada pelo identificador ou slug fornecido.
- **`409 Conflict`:** Conflito de agenda de atividades na grade do participante ou duplicidade de certificado para o mesmo usuário e atividade.
- **`500 Internal Server Error`:** Falhas de infraestrutura não esperadas (nunca expondo stack trace para o cliente).

---

## 3. Roteamento Amigável, Slugs e Kebab-Case (Contrato Frontend #74)

Para viabilizar SEO eficiente e rotas intuitivas no cliente Next.js (`/eventos/[slug]` e `/gerenciar/[slug]`), o backend adota uma estratégia padronizada de **slugs** em `kebab-case`:

### 3.1 Algoritmo de Normalização de Slug (`eventos.service.ts`):

```typescript
export function normalizarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### 3.2 Resolução e Desambiguação de Slugs:

1. **Derivação Base:** O slug é derivado prioritariamente da combinação da sigla com o número da edição (ex.: `secint-2026`), ou da sigla isolada, ou do nome da marca/evento.
2. **Garantia de Unicidade:** Durante o cadastro atômico do evento, o sistema consulta a existência do slug no banco. Havendo colisão, anexa-se um contador incremental sequencial (ex.: `secint-2026-1`, `secint-2026-2`).
3. **Intercambialidade de Identificadores:**
   - O endpoint `GET /eventos/:slug` resolve a edição tanto se o parâmetro for um slug textual (`secint-2026`) quanto se for um ID numérico puro (`1`, `2`).
   - Todos os objetos de edição retornados pela API incluem a propriedade computada `slug`, garantindo consistência com os hooks de roteamento do frontend.

---

## 4. Documentação Interativa: OpenAPI 3.0 / Swagger (RF14)

A documentação viva dos contratos está disponível no path relativo `/api/docs`:

### 4.1 Configuração Central (`main.ts`):

- Gerada dinamicamente pelo NestJS com `@nestjs/swagger`.
- Título: **AcadEvent API**.
- Suporte nativo a autenticação Bearer Token (`.addBearerAuth()`).

### 4.2 Agrupamento Temático por Tags:

Para facilitar a navegação e o consumo pelos desenvolvedores frontend e mobile, os endpoints são agrupados em tags de domínio:

- `auth`: Autenticação e perfil do usuário.
- `eventos`: Vitrine pública e gestão de marcas e edições.
- `espacos`: Salas e reservas físicas.
- `atividades`: Atividades acadêmicas, ministrantes e chamada.
- `inscricoes`: Lotes, cupons, inscrições e validação de QR Code.
- `pagamentos`: Webhooks externos, confirmação manual e relatórios financeiros.
- `certificados`: Emissão, consulta pública e download em PDF.
- `storage`: Upload multipart e recuperação de arquivos.
- `comunicacao`: Histórico e disparo de comunicados.
- `inventario`: Itens físicos e baixas de estoque.
- `submissoes`: Trabalhos científicos e avaliações de pareceristas.
- `admin`: Consulta de trilha de auditoria para administradores (`GET /admin/logs`).

---

## 5. Validação Global de Entrada e Integridade de Payload

A API opera com validação defensiva global via **`ValidationPipe`** do NestJS:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

### Justificativas das Opções:

1. **`transform: true`:** Converte automaticamente tipos de dados das requisições com base nas anotações TypeScript (ex.: strings numéricas em rotas são convertidas para `number`).
2. **`whitelist: true`:** Remove silenciosamente propriedades que não constem na definição da classe DTO, prevenindo ataques de **Mass Assignment** (onde um usuário malicioso tenta injetar campos privilegiados como `is_admin: true`).
3. **`forbidNonWhitelisted: true`:** Rejeita imediatamente com `400 Bad Request` requisições que contenham propriedades não reconhecidas, forçando contratos estritos entre frontend e backend.

---

## 6. Política de Cross-Origin Resource Sharing (CORS)

Para suportar o ecossistema multiplataforma (Web Next.js e Mobile), o CORS é configurado no bootstrap:

1. **Origens Permitidas:**
   - Configuráveis via variável de ambiente `CORS_ORIGIN` (aceitando listas separadas por vírgula).
   - Defaults de desenvolvimento:
     - `http://localhost:3000` (API / Swagger)
     - `http://localhost:3001` (Frontend Next.js)
     - `http://localhost:5173` (Ambiente Mobile / Vite)
2. **Credenciais:** `credentials: true` ativado para viabilizar envio de cookies de sessão httpOnly e credenciais autenticadas.

---

## 7. Integração e Resolução de URLs de Frontend

Quando o backend precisa gerar links acessíveis por seres humanos (como no rodapé impresso do PDF de certificados e em QR Codes de credenciamento):

- O backend lê a variável de ambiente **`FRONTEND_URL`** (default de desenvolvimento: `http://localhost:3001`).
- O link impresso aponta para a rota pública do frontend:
  ```text
  Valide este certificado em: http://localhost:3001/validar/AUTH-9933-ENF
  ```
- **Decisão do PR #44 (Item 2.3):** Corrigido o direcionamento anterior que apontava incorretamente para a porta 3000 (onde a rota de visualização HTML não existe), restabelecendo o contrato correto com a aplicação Web do AcadEvent.
