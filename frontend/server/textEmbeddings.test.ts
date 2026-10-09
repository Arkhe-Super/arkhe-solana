import { describe, expect, it, vi } from 'vitest';
import { EMBEDDING_DIMENSIONS } from './embeddings.js';
import { saveTextEmbedding, searchTextEmbeddings } from './textEmbeddings.js';

const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0.01);

describe('text embedding queries', () => {
  it('persists embeddings with parameterized pgvector input', async () => {
    const stored = {
      id: 1,
      work_uuid: '550e8400-e29b-41d4-a716-446655440000',
      content_text: 'Arkhe test work',
      model: 'BAAI/bge-m3',
      created_at: new Date(),
    };
    const query = vi.fn().mockResolvedValue({ rows: [stored] });

    await expect(
      saveTextEmbedding({ query } as never, {
        workUuid: stored.work_uuid,
        contentText: stored.content_text,
        embedding: vector,
      })
    ).resolves.toEqual(stored);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO work_text_embeddings'),
      [stored.work_uuid, stored.content_text, expect.stringMatching(/^\[/), 'BAAI/bge-m3']
    );
  });

  it('searches stored embeddings with cosine distance', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await expect(searchTextEmbeddings({ query } as never, { embedding: vector, limit: 5 })).resolves.toEqual([]);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('embedding <=> $1::vector'),
      [expect.stringMatching(/^\[/), 5]
    );
  });

  it('rejects an invalid search limit before querying the database', async () => {
    const query = vi.fn();

    await expect(searchTextEmbeddings({ query } as never, { embedding: vector, limit: 101 })).rejects.toThrow(
      'Search limit must be an integer between 1 and 100'
    );
    expect(query).not.toHaveBeenCalled();
  });
});
