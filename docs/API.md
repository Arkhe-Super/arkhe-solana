# API do Arkhe

As funções HTTP ficam em `frontend/api/` e são publicadas pela Vercel com
`frontend` como Root Directory. Os exemplos usam URLs relativas, portanto o
frontend deve chamar a API no mesmo domínio do Preview ou da produção.

Nos exemplos de terminal, defina a URL do deployment que deseja testar:

```bash
export ARKHE_BASE_URL="https://<deployment-host>"
```

## Convenções e segurança

- As respostas são JSON.
- Operações de escrita exigem `Authorization: Bearer <ARKHE_WRITE_API_KEY>`.
  Essa chave é exclusivamente de servidor/integrador confiável: nunca deve ser
  incluída no bundle do navegador.
- `GET /api/works` e `POST /api/embeddings` com `action: "search"` são
  públicos por enquanto.
- As consultas PostgreSQL usam parâmetros. Falhas de disponibilidade ou de
  autenticação do banco retornam `503` com `Database unavailable`, sem expor a
  connection string.
- Não há cabeçalhos CORS específicos. O cliente existente consome as rotas
  relativas no mesmo domínio.

## `GET /api/health`

Retorna o estado do processo da API. O handler atual não faz consulta ao
PostgreSQL e não restringe o método HTTP; o uso previsto é `GET`.

### Resposta `200`

```json
{
  "status": "ok",
  "service": "arkhe-api"
}
```

### Exemplo

```bash
curl "$ARKHE_BASE_URL/api/health"
```

## `/api/works`

### `GET /api/works`

Lista no máximo 100 obras, ordenadas por `uuid`.

### Resposta `200`

```json
{
  "status": "ok",
  "endpoint": "works",
  "message": "Works API is running",
  "works": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "blake3_hash": null,
      "c2pa_manifest": {
        "source": "example"
      }
    }
  ]
}
```

### `POST /api/works`

Cria uma obra. Requer Bearer token.

#### Payload

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "blake3_hash": null,
  "c2pa_manifest": {
    "source": "example"
  }
}
```

- `uuid`: UUID em formato textual.
- `blake3_hash`: string ou `null`.
- `c2pa_manifest`: objeto JSON não nulo.

#### Exemplo

```bash
curl -X POST "$ARKHE_BASE_URL/api/works" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ARKHE_WRITE_API_KEY>' \
  --data '{"uuid":"550e8400-e29b-41d4-a716-446655440000","blake3_hash":null,"c2pa_manifest":{"source":"example"}}'
```

#### Resposta `201`

```json
{
  "status": "created",
  "work": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "blake3_hash": null,
    "c2pa_manifest": {
      "source": "example"
    }
  }
}
```

## `POST /api/embeddings`

Usa Cloudflare Workers AI com `@cf/baai/bge-m3`. O backend exige que a
resposta tenha exatamente 1024 números finitos antes de usar pgvector.

Textos são removidos de espaços nas extremidades, devem ser não vazios e ter no
máximo 32.000 caracteres. A métrica da busca é distância de cosseno do
pgvector; valores menores em `cosine_distance` representam resultados mais
próximos.

### Busca pública: `action: "search"`

#### Payload

```json
{
  "action": "search",
  "query": "obra sobre proveniência musical",
  "limit": 10
}
```

- `query`: texto não vazio.
- `limit`: opcional; inteiro entre 1 e 100. O padrão é 10.

#### Exemplo

```bash
curl -X POST "$ARKHE_BASE_URL/api/embeddings" \
  -H 'Content-Type: application/json' \
  --data '{"action":"search","query":"obra sobre proveniência musical","limit":10}'
```

#### Resposta `200`

```json
{
  "status": "ok",
  "matches": [
    {
      "id": 1,
      "work_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "content_text": "Texto indexado da obra",
      "model": "BAAI/bge-m3",
      "created_at": "2026-10-11T12:00:00.000Z",
      "cosine_distance": 0.12
    }
  ]
}
```

Essa busca é **textual**. Ela não compara áudio, CLAP ou melodias.

### Indexação protegida: `action: "index"`

#### Payload

```json
{
  "action": "index",
  "work_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "content_text": "Descrição textual da obra"
}
```

`work_uuid` precisa ser UUID e referenciar uma obra existente. Requer Bearer
token.

#### Exemplo

```bash
curl -X POST "$ARKHE_BASE_URL/api/embeddings" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ARKHE_WRITE_API_KEY>' \
  --data '{"action":"index","work_uuid":"550e8400-e29b-41d4-a716-446655440000","content_text":"Descrição textual da obra"}'
```

#### Resposta `201`

```json
{
  "status": "created",
  "embedding": {
    "id": 1,
    "work_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "content_text": "Descrição textual da obra",
    "model": "BAAI/bge-m3",
    "created_at": "2026-10-11T12:00:00.000Z"
  }
}
```

## `/api/provenance-reports`

Os relatórios são aceitos apenas quando satisfazem a validação estrutural v1.1
implementada pelo backend. Essa validação **não** verifica C2PA, assinatura,
MMR, Solana, autoria ou proveniência criptograficamente.

### `POST /api/provenance-reports`

Requer Bearer token. O payload precisa conter estes campos de topo:

```json
{
  "schema_version": "1.1",
  "generated_at": "2026-10-11T12:00:00Z",
  "target_a": {
    "title": "Obra A",
    "artist": "Artista A",
    "year": 2020,
    "mbid": "550e8400-e29b-41d4-a716-446655440000",
    "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  },
  "target_b": {
    "title": "Obra B",
    "artist": "Artista B",
    "year": 2021,
    "mbid": "660e8400-e29b-41d4-a716-446655440000",
    "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  },
  "similarity": {},
  "manifest": {},
  "script_sha256": "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "content_hash": "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
  "trust_policy": "integrity_only",
  "trust_context": {
    "verifier": "arkhe-preflight",
    "verifier_version": "1.1",
    "trust_basis": "structural_validation"
  }
}
```

Os campos opcionais suportados são `anchor`, `c2pa` e `envelope_hash`. Quando
presentes, eles são validados estruturalmente. Hashes são SHA-256 em hexadecimal
minúsculo com 64 caracteres; datas precisam ter timezone; objetos não aceitam
campos extras fora do contrato.

#### Exemplo

```bash
curl -X POST "$ARKHE_BASE_URL/api/provenance-reports" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ARKHE_WRITE_API_KEY>' \
  --data @report.json
```

#### Resposta `201`

```json
{
  "status": "created",
  "report": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "schema_version": "1.1",
    "content_hash": "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    "verification_status": "structurally_valid",
    "created_at": "2026-10-11T12:00:00.000Z"
  },
  "message": "The report is structurally valid. C2PA, Solana, MMR, authorship, and provenance were not verified cryptographically."
}
```

### `GET /api/provenance-reports?id=<uuid>`

Consulta um relatório persistido. Atualmente é público.

#### Resposta `200`

```json
{
  "status": "ok",
  "report": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "schema_version": "1.1",
    "content_hash": "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    "report": {},
    "verification_status": "structurally_valid",
    "created_at": "2026-10-11T12:00:00.000Z"
  }
}
```

## Erros HTTP

| Status | Situação |
|---|---|
| `400` | Payload inválido, ação inválida, limite inválido ou UUID de relatório ausente/inválido. |
| `401` | Bearer ausente ou incorreto em operação de escrita. |
| `404` | Relatório de proveniência não encontrado. |
| `405` | Método não permitido para `/api/works`, `/api/embeddings` ou `/api/provenance-reports`. |
| `500` | Falha inesperada do backend, sem detalhes internos na resposta. |
| `502` | Cloudflare Workers AI indisponível ou retornou embedding inválido. |
| `503` | Variável de servidor ausente ou banco indisponível. |
| `504` | Timeout da requisição de embedding à Cloudflare. |

## Banco e limitações atuais

As migrations devem ser aplicadas em ordem e uma única vez:

1. `database/migrations/001_initial_schema.sql` cria `works`, `events`,
   `eas_attestations` e `nodes`.
2. `database/migrations/002_add_text_embeddings.sql` habilita `vector`, cria
   `work_text_embeddings`, usa `VECTOR(1024)` e índice HNSW com cosseno.
3. `database/migrations/003_add_provenance_reports.sql` cria
   `provenance_reports` e o índice por `content_hash`.

Nenhuma migration deve ser aplicada automaticamente. No estado atual do Preview,
a credencial do Neon falha na autenticação PostgreSQL; logo, persistência e
consulta reais de obras, embeddings e relatórios continuam bloqueadas até que
uma `DATABASE_URL` válida de um banco Preview isolado seja configurada.
