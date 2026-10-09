import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({ getPool: vi.fn() }));

vi.mock('../server/db.js', () => database);

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
    database.getPool.mockReset();
  });

  it('returns persisted works on GET', async () => {
    database.getPool.mockReturnValue({ query: vi.fn().mockResolvedValue({ rows: [] }) });
    const { response, result } = createResponse();

    await handler({ method: 'GET' }, response);

    expect(result()).toEqual({
      statusCode: 200,
      body: expect.objectContaining({ endpoint: 'works', works: [] }),
    });
  });

  it('reports a missing database configuration without exposing credentials', async () => {
    database.getPool.mockImplementation(() => {
      throw new Error('DATABASE_URL is not configured');
    });
    const { response, result } = createResponse();

    await handler({ method: 'GET' }, response);

    expect(result()).toEqual({
      statusCode: 503,
      body: { error: 'DATABASE_URL is not configured' },
    });
  });
});
