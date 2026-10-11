import { getPool } from '../server/db.js';
import { isWriteAuthorized } from '../server/auth.js';
import { validateProvenanceReport } from '../server/provenanceReport.js';
import { getProvenanceReport, saveProvenanceReport } from '../server/provenanceReports.js';

type ApiRequest = {
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => { json: (body: unknown) => void };
};

function logDatabaseFailure(endpoint: string, error: unknown) {
  const failure = error as { code?: unknown; name?: unknown } | undefined;
  console.error('Database request failed', {
    endpoint,
    code: typeof failure?.code === 'string' ? failure.code : undefined,
    name: typeof failure?.name === 'string' ? failure.name : 'UnknownError',
  });
}

/**
 * Saves structurally valid provenance reports. Cryptographic verification remains
 * the responsibility of the separate preflight service.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'GET') {
    const id = req.query?.id;
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
      return res.status(400).json({ error: 'A valid report id is required' });
    }

    try {
      const report = await getProvenanceReport(getPool(), id);
      if (!report) return res.status(404).json({ error: 'Provenance report not found' });
      return res.status(200).json({ status: 'ok', report });
    } catch (error) {
      if (error instanceof Error && error.message === 'DATABASE_URL is not configured') {
        return res.status(503).json({ error: error.message });
      }
      logDatabaseFailure('provenance-reports:get', error);
      return res.status(500).json({ error: 'Unable to access provenance reports' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!isWriteAuthorized(req.headers?.authorization)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'ARKHE_WRITE_API_KEY is not configured') {
      return res.status(503).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unable to authorize provenance report' });
  }

  const validation = validateProvenanceReport(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid provenance report schema',
      details: validation.errors,
    });
  }

  try {
    const report = await saveProvenanceReport(getPool(), validation.report);
    return res.status(201).json({
      status: 'created',
      report: {
        id: report.id,
        schema_version: report.schema_version,
        content_hash: report.content_hash,
        verification_status: report.verification_status,
        created_at: report.created_at,
      },
      message: 'The report is structurally valid. C2PA, Solana, MMR, authorship, and provenance were not verified cryptographically.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_URL is not configured') {
      return res.status(503).json({ error: error.message });
    }
    logDatabaseFailure('provenance-reports:post', error);
    return res.status(500).json({ error: 'Unable to persist provenance report' });
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
