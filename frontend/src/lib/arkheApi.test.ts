import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArkheApiError, getWorks, searchWorks } from './arkheApi';

const fetchMock = vi.fn();

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('Arkhe API client', () => {
  it('loads works from the relative API route', async () => {
    const works = [{ uuid: 'work-1', blake3_hash: null, c2pa_manifest: { title: 'Arkhe' } }];
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: 'ok', works }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWorks()).resolves.toEqual(works);
    expect(fetchMock).toHaveBeenCalledWith('/api/works');
  });

  it('sends a semantic text search using the public API contract', async () => {
    const matches = [{
      id: 1,
      work_uuid: 'work-1',
      content_text: 'A work about provenance',
      model: '@cf/baai/bge-m3',
      created_at: '2026-10-10T00:00:00.000Z',
      cosine_distance: 0.12,
    }];
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: 'ok', matches }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchWorks('  provenance  ', 5)).resolves.toEqual(matches);
    expect(fetchMock).toHaveBeenCalledWith('/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'search', query: 'provenance', limit: 5 }),
    });
  });

  it('surfaces API errors without returning partial data', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: 'Unable to access works' }), { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWorks()).rejects.toEqual(new ArkheApiError('Unable to access works', 500));
  });
});
