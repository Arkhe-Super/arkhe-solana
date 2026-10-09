import { beforeEach, describe, expect, it, vi } from 'vitest';

const dependencies = vi.hoisted(() => ({
  getPool: vi.fn(),
  isWriteAuthorized: vi.fn(),
}));

vi.mock('../server/db.js', () => ({ getPool: dependencies.getPool }));
vi.mock('../server/auth.js', () => ({ isWriteAuthorized: dependencies.isWriteAuthorized }));

import handler from '../api/works.js';

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

describe('/api/works', () => {
  beforeEach(() => {
    dependencies.getPool.mockReset();
    dependencies.isWriteAuthorized.mockReset();
  });

  it('returns persisted works on GET', async () => {
    dependencies.getPool.mockReturnValue({ query: vi.fn().mockResolvedValue({ rows: [] }) });
    const { response, result } = createResponse();

    await handler({ method: 'GET' }, response);

    expect(result()).toEqual({
      statusCode: 200,
      body: expect.objectContaining({ endpoint: 'works', works: [] }),
    });
  });

  it('reports a missing database configuration without exposing credentials', async () => {
    dependencies.getPool.mockImplementation(() => {
      throw new Error('DATABASE_URL is not configured');
    });
    const { response, result } = createResponse();

    await handler({ method: 'GET' }, response);

    expect(result()).toEqual({
      statusCode: 503,
      body: { error: 'DATABASE_URL is not configured' },
    });
  });

  it('rejects an unauthorized POST before accessing the database', async () => {
    dependencies.isWriteAuthorized.mockReturnValue(false);
    const { response, result } = createResponse();

    await handler(
      {
        method: 'POST',
        headers: { authorization: 'Bearer invalid' },
        body: {
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          blake3_hash: null,
          c2pa_manifest: { source: 'test' },
        },
      },
      response
    );

    expect(result()).toEqual({ statusCode: 401, body: { error: 'Unauthorized' } });
    expect(dependencies.getPool).not.toHaveBeenCalled();
  });

  it('allows an authorized POST', async () => {
    const work = {
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      blake3_hash: null,
      c2pa_manifest: { source: 'test' },
    };
    dependencies.isWriteAuthorized.mockReturnValue(true);
    dependencies.getPool.mockReturnValue({ query: vi.fn().mockResolvedValue({ rows: [work] }) });
    const { response, result } = createResponse();

    await handler({ method: 'POST', headers: { authorization: 'Bearer valid' }, body: work }, response);

    expect(result()).toEqual({ statusCode: 201, body: { status: 'created', work } });
  });
});
