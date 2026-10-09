import type { Pool } from 'pg';
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, validateEmbedding } from './embeddings';

export type TextEmbedding = {
  content_text: string;
  created_at: Date;
  id: number;
  model: string;
  work_uuid: string;
};

export type SimilarWork = TextEmbedding & {
  cosine_distance: number;
};

function toPgVector(embedding: unknown): string {
  return `[${validateEmbedding(embedding).join(',')}]`;
}

export async function saveTextEmbedding(
  pool: Pool,
  input: { contentText: string; embedding: number[]; model?: string; workUuid: string }
): Promise<TextEmbedding> {
  if (!input.contentText.trim()) {
    throw new Error('Text for embedding cannot be empty');
  }

  const result = await pool.query<TextEmbedding>(
    `INSERT INTO work_text_embeddings (work_uuid, content_text, embedding, model)
     VALUES ($1, $2, $3::vector, $4)
     RETURNING id, work_uuid, content_text, model, created_at`,
    [
      input.workUuid,
      input.contentText,
      toPgVector(input.embedding),
      input.model || EMBEDDING_MODEL,
    ]
  );

  return result.rows[0];
}

export async function searchTextEmbeddings(
  pool: Pool,
  input: { embedding: number[]; limit?: number }
): Promise<SimilarWork[]> {
  const limit = input.limit ?? 10;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Search limit must be an integer between 1 and 100');
  }

  const result = await pool.query<SimilarWork>(
    `SELECT id, work_uuid, content_text, model, created_at,
            embedding <=> $1::vector AS cosine_distance
     FROM work_text_embeddings
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [toPgVector(input.embedding), limit]
  );

  return result.rows;
}

export { EMBEDDING_DIMENSIONS };
