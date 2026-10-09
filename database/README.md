# Banco de Dados - Arkhe

Este diretório contém a estrutura inicial do banco de dados do projeto Arkhe.

## Pré-requisitos

Para utilizar o banco localmente, é necessário ter instalado:

- PostgreSQL
- extensão pgvector

## Banco de dados

Crie um banco chamado:

```sql
arkhe
```

## Variáveis de ambiente do backend

Configure estas variáveis no ambiente local e no projeto Vercel, sem versionar credenciais:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/arkhe
CLOUDFLARE_API_TOKEN=replace_with_a_workers_ai_api_token
CLOUDFLARE_ACCOUNT_ID=replace_with_your_cloudflare_account_id
```

O backend usa a API REST Workers AI com o modelo `@cf/baai/bge-m3`. Mantenha os valores apenas no ambiente local e na Vercel; não os versione.

## Aplicação local das migrations

Com PostgreSQL e pgvector disponíveis, aplique as migrations em ordem:

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f database/migrations/002_add_text_embeddings.sql
```

Não execute estes comandos em banco remoto sem aprovação explícita.
