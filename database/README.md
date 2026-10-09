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
HF_TOKEN=hf_replace_with_a_token_that_can_call_inference_providers
HF_INFERENCE_URL=https://router.huggingface.co/hf-inference/models/BAAI/bge-m3
```

`HF_INFERENCE_URL` é opcional e permite trocar o endpoint por um provedor compatível sem alterar a interface do backend.

## Aplicação local das migrations

Com PostgreSQL e pgvector disponíveis, aplique as migrations em ordem:

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f database/migrations/002_add_text_embeddings.sql
```

Não execute estes comandos em banco remoto sem aprovação explícita.
