import { getPool } from '../server/db.js';
import {
  EmbeddingProviderError,
  CloudflareEmbeddingProvider,
  validateEmbeddingText,
} from '../server/embeddings.js';
import { saveTextEmbedding, searchTextEmbeddings } from '../server/textEmbeddings.js';

type ApiRequest = {
  body?: unknown;
  method?: string;
};

type ApiResponse = {
  status: (code: number) => { json: (body: unknown) => void };
};

type IndexRequest = {
  action: 'index';
  content_text: string;
  work_uuid: string;
};

type SearchRequest = {
  action: 'search';
  limit?: number;
  query: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidText(value: unknown): value is string {
  try {
    validateEmbeddingText(value);
    return true;
  } catch {
    return false;
  }
}

function isValidSearchLimit(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 100);
}

function isIndexRequest(value: unknown): value is IndexRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const request = value as Partial<IndexRequest>;
  return (
    request.action === 'index' &&
    typeof request.work_uuid === 'string' &&
    UUID_PATTERN.test(request.work_uuid) &&
    isValidText(request.content_text)
  );
}

function isSearchRequest(value: unknown): value is SearchRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const request = value as Partial<SearchRequest>;
  return (
    request.action === 'search' &&
    isValidText(request.query) &&
    isValidSearchLimit(request.limit)
  );
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (isIndexRequest(req.body)) {
      const provider = CloudflareEmbeddingProvider.fromEnvironment();
      const pool = getPool();
      const embedding = await provider.embed(req.body.content_text);
      const textEmbedding = await saveTextEmbedding(pool, {
        workUuid: req.body.work_uuid,
        contentText: req.body.content_text,
        embedding,
      });

      return res.status(201).json({ status: 'created', embedding: textEmbedding });
    }

    if (isSearchRequest(req.body)) {
      const provider = CloudflareEmbeddingProvider.fromEnvironment();
      const pool = getPool();
      const embedding = await provider.embed(req.body.query);
      const matches = await searchTextEmbeddings(pool, {
        embedding,
        limit: req.body.limit,
      });

      return res.status(200).json({ status: 'ok', matches });
    }

    return res.status(400).json({
      error: 'Provide action=index with work_uuid and content_text, or action=search with query',
    });
  } catch (error) {
    if (error instanceof Error && /^(DATABASE_URL|CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID) is not configured$/.test(error.message)) {
      return res.status(503).json({ error: error.message });
    }

    if (error instanceof EmbeddingProviderError) {
      console.error('Embedding provider request failed', {
        message: error.message,
        statusCode: error.statusCode,
      });
      return res.status(error.statusCode).json({ error: 'Embedding provider is unavailable' });
    }

    return res.status(500).json({ error: 'Unable to process embeddings' });
  }
}
