import { beforeEach, describe, expect, it, vi } from 'vitest';

import { validProvenanceReport } from './provenanceReport.fixture.js';

const dependencies = vi.hoisted(() => ({
  getPool: vi.fn(),
  isDatabaseUnavailableError: vi.fn(),
  isWriteAuthorized: vi.fn(),
}));

vi.mock('../server/auth.js', () => ({ isWriteAuthorized: dependencies.isWriteAuthorized }));
vi.mock('../server/db.js', () => ({
  getPool: dependencies.getPool,
  isDatabaseUnavailableError: dependencies.isDatabaseUnavailableError,
}));

import handler from '../api/provenance-reports.js';

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

describe('/api/provenance-reports', () => {
  beforeEach(() => {
    dependencies.getPool.mockReset();
    dependencies.isDatabaseUnavailableError.mockReset();
    dependencies.isWriteAuthorized.mockReset();
  });

  it('rejects a request without authorization', async () => {
    dependencies.isWriteAuthorized.mockReturnValue(false);
    const { response, result } = createResponse();

    await handler({ method: 'POST', body: validProvenanceReport() }, response);

    expect(result()).toEqual({ statusCode: 401, body: { error: 'Unauthorized' } });
  });

  it('rejects an incorrect Bearer token before validating the payload', async () => {
    dependencies.isWriteAuthorized.mockReturnValue(false);
    const { response, result } = createResponse();

    await handler(
      { method: 'POST', headers: { authorization: 'Bearer incorrect' }, body: validProvenanceReport() },
      response
    );

    expect(result()).toEqual({ statusCode: 401, body: { error: 'Unauthorized' } });
  });

  it('rejects an invalid report after authorization', async () => {
    dependencies.isWriteAuthorized.mockReturnValue(true);
    const { response, result } = createResponse();

    await handler({ method: 'POST', body: { schema_version: '1.1' } }, response);

    expect(result()).toEqual({
      statusCode: 400,
      body: expect.objectContaining({
        error: 'Invalid provenance report schema',
        details: expect.any(Array),
      }),
    });
  });

  it('persists an authorized structurally valid report', async () => {
    dependencies.isWriteAuthorized.mockReturnValue(true);
    const stored = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      schema_version: '1.1',
      content_hash: 'd'.repeat(64),
      verification_status: 'structurally_valid',
      created_at: new Date('2026-10-11T12:00:00.000Z'),
      report: validProvenanceReport(),
    };
    const query = vi.fn().mockResolvedValue({ rows: [stored] });
    dependencies.getPool.mockReturnValue({ query });
    const { response, result } = createResponse();

    await handler({ method: 'POST', body: validProvenanceReport() }, response);

    expect(result()).toEqual({
      statusCode: 201,
      body: expect.objectContaining({
        status: 'created',
        report: expect.objectContaining({
          id: stored.id,
          verification_status: 'structurally_valid',
        }),
      }),
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO provenance_reports'),
      expect.arrayContaining(['1.1', 'd'.repeat(64), expect.any(Object), 'structurally_valid'])
    );
  });

  it('returns a saved report by id', async () => {
    const stored = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      schema_version: '1.1',
      content_hash: 'd'.repeat(64),
      verification_status: 'structurally_valid',
      created_at: new Date('2026-10-11T12:00:00.000Z'),
      report: validProvenanceReport(),
    };
    dependencies.getPool.mockReturnValue({ query: vi.fn().mockResolvedValue({ rows: [stored] }) });
    const { response, result } = createResponse();

    await handler({ method: 'GET', query: { id: stored.id } }, response);

    expect(result()).toEqual({ statusCode: 200, body: { status: 'ok', report: stored } });
  });

  it('returns database errors without exposing database details', async () => {
    dependencies.isWriteAuthorized.mockReturnValue(true);
    dependencies.getPool.mockImplementation(() => {
      throw new Error('database connection refused: sensitive-host');
    });
    const { response, result } = createResponse();

    await handler({ method: 'POST', body: validProvenanceReport() }, response);

    expect(result()).toEqual({ statusCode: 500, body: { error: 'Unable to persist provenance report' } });
  });

  it('reports an unavailable database without exposing PostgreSQL details', async () => {
    dependencies.getPool.mockImplementation(() => {
      throw { code: '28P01', name: 'error' };
    });
    dependencies.isDatabaseUnavailableError.mockReturnValue(true);
    const { response, result } = createResponse();

    await handler(
      { method: 'GET', query: { id: '550e8400-e29b-41d4-a716-446655440000' } },
      response
    );

    expect(result()).toEqual({ statusCode: 503, body: { error: 'Database unavailable' } });
  });
});
