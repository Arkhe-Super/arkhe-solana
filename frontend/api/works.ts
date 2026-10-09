import { getPool } from '../server/db.js';
import { isWriteAuthorized } from '../server/auth.js';
import { createWork, listWorks, type NewWork } from '../server/works.js';

type ApiRequest = {
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
};

type ApiResponse = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

function isNewWork(value: unknown): value is NewWork {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const work = value as Partial<NewWork>;
  return (
    typeof work.uuid === 'string' &&
    (typeof work.blake3_hash === 'string' || work.blake3_hash === null) &&
    !!work.c2pa_manifest &&
    typeof work.c2pa_manifest === 'object' &&
    !Array.isArray(work.c2pa_manifest)
  );
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
) {
  try {
    if (req.method === 'GET' || !req.method) {
      const pool = getPool();
      const works = await listWorks(pool);
      return res.status(200).json({
        status: 'ok',
        endpoint: 'works',
        message: 'Works API is running',
        works,
      });
    }

    if (req.method === 'POST') {
      if (!isNewWork(req.body)) {
        return res.status(400).json({
          error: 'uuid, blake3_hash and c2pa_manifest are required',
        });
      }

      if (!isWriteAuthorized(req.headers?.authorization)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const pool = getPool();
      const work = await createWork(pool, req.body);
      return res.status(201).json({ status: 'created', work });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof Error && /^(DATABASE_URL|ARKHE_WRITE_API_KEY) is not configured$/.test(error.message)) {
      return res.status(503).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Unable to access works' });
  }
}
