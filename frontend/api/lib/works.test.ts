import { describe, expect, it, vi } from 'vitest';
import { createWork, listWorks, type Work } from './works';

const work: Work = {
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  blake3_hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  c2pa_manifest: { title: 'Obra de teste', creator: 'Arkhe Test' },
};

describe('works database queries', () => {
  it('lists works using the existing schema columns', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [work] });
    const works = await listWorks({ query } as never);

    expect(works).toEqual([work]);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM works'));
  });

  it('inserts a work with parameterized values', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [work] });
    const created = await createWork({ query } as never, work);

    expect(created).toEqual(work);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO works'),
      [work.uuid, work.blake3_hash, work.c2pa_manifest]
    );
  });
});
