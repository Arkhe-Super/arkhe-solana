import { beforeEach, describe, expect, it, vi } from 'vitest';

const dependencies = vi.hoisted(() => ({
  getPool: vi.fn(),
  isWriteAuthorized: vi.fn(),
  fromEnvironment: vi.fn(),
  saveTextEmbedding: vi.fn(),
  searchTextEmbeddings: vi.fn(),
}));

vi.mock('../server/db.js', () => ({ getPool: dependencies.getPool }));
vi.mock('../server/auth.js', () => ({ isWriteAuthorized: dependencies.isWriteAuthorized }));
vi.mock('../server/embeddings.js', () => ({
  EmbeddingProviderError: class extends Error {},
  CloudflareEmbeddingProvider: { fromEnvironment: dependencies.fromEnvironment },
  validateEmbeddingText: (value: unknown) => {
    if (typeof value !== 'string' || !value.trim() || value.length > 32_000) {
      throw new Error('Invalid embedding text');
    }
    return value.trim();
  },
}));
vi.mock('../server/textEmbeddings.js', () => ({
  saveTextEmbedding: dependencies.saveTextEmbedding,
  searchTextEmbeddings: dependencies.searchTextEmbeddings,
}));

import handler from '../api/embeddings.js';

function createResponse() {
  let statusCode: number | undefined;
  let body: unknown;

  return {
    response: {
      status(code: number) {
        statusCode = code;
        return { json(value: unknown) { body = value; } };
      },
    },
    result: () => ({ statusCode, body }),
  };
}

describe('/api/embeddings input validation', () => {
  beforeEach(() => {
    Object.values(dependencies).forEach((mock) => mock.mockReset());
  });

  it('rejects a malformed work UUID before calling external services', async () => {
    const { response, result } = createResponse();

    await handler(
      { method: 'POST', body: { action: 'index', work_uuid: 'not-a-uuid', content_text: 'Arkhe' } },
      response
    );

    expect(result()).toEqual({ statusCode: 400, body: expect.objectContaining({ error: expect.any(String) }) });
    expect(dependencies.fromEnvironment).not.toHaveBeenCalled();
  });

  it('rejects an empty query and invalid limit before calling external services', async () => {
    const { response, result } = createResponse();

    await handler(
      { method: 'POST', body: { action: 'search', query: ' ', limit: 101 } },
      response
    );

    expect(result()).toEqual({ statusCode: 400, body: expect.objectContaining({ error: expect.any(String) }) });
    expect(dependencies.fromEnvironment).not.toHaveBeenCalled();
  });

  it('rejects an unauthorized index request before calling external services', async () => {
    dependencies.isWriteAuthorized.mockReturnValue(false);
    const { response, result } = createResponse();

    await handler(
      {
        method: 'POST',
        headers: { authorization: 'Bearer invalid' },
        body: {
          action: 'index',
          work_uuid: '550e8400-e29b-41d4-a716-446655440000',
          content_text: 'Arkhe test work',
        },
      },
      response
    );

    expect(result()).toEqual({ statusCode: 401, body: { error: 'Unauthorized' } });
    expect(dependencies.fromEnvironment).not.toHaveBeenCalled();
    expect(dependencies.getPool).not.toHaveBeenCalled();
  });

  it('allows an authorized index request', async () => {
    const embedding = Array.from({ length: 1024 }, () => 0.01);
    const stored = { id: 1, work_uuid: '550e8400-e29b-41d4-a716-446655440000' };
    dependencies.isWriteAuthorized.mockReturnValue(true);
    dependencies.getPool.mockReturnValue({});
    dependencies.fromEnvironment.mockReturnValue({ embed: vi.fn().mockResolvedValue(embedding) });
    dependencies.saveTextEmbedding.mockResolvedValue(stored);
    const { response, result } = createResponse();

    await handler(
      {
        method: 'POST',
        headers: { authorization: 'Bearer valid' },
        body: {
          action: 'index',
          work_uuid: stored.work_uuid,
          content_text: 'Arkhe test work',
        },
      },
      response
    );

    expect(result()).toEqual({ statusCode: 201, body: { status: 'created', embedding: stored } });
  });
});
