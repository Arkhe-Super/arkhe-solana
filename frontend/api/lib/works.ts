import type { Pool } from 'pg';

export type Work = {
  uuid: string;
  blake3_hash: string | null;
  c2pa_manifest: Record<string, unknown>;
};

export type NewWork = Work;

export async function listWorks(pool: Pool): Promise<Work[]> {
  const result = await pool.query<Work>(
    `SELECT uuid, blake3_hash, c2pa_manifest
     FROM works
     ORDER BY uuid
     LIMIT 100`
  );

  return result.rows;
}

export async function createWork(pool: Pool, work: NewWork): Promise<Work> {
  const result = await pool.query<Work>(
    `INSERT INTO works (uuid, blake3_hash, c2pa_manifest)
     VALUES ($1, $2, $3)
     RETURNING uuid, blake3_hash, c2pa_manifest`,
    [work.uuid, work.blake3_hash, work.c2pa_manifest]
  );

  return result.rows[0];
}
