import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';

import type { ProvenanceReport } from './provenanceReport.js';

export const STRUCTURALLY_VALID = 'structurally_valid' as const;
export const CRYPTOGRAPHICALLY_VERIFIED = 'cryptographically_verified' as const;

export type ProvenanceVerificationStatus =
  | typeof STRUCTURALLY_VALID
  | typeof CRYPTOGRAPHICALLY_VERIFIED;

export type StoredProvenanceReport = {
  id: string;
  schema_version: string;
  content_hash: string;
  report: ProvenanceReport;
  verification_status: ProvenanceVerificationStatus;
  created_at: Date;
};

export async function saveProvenanceReport(
  pool: Pool,
  report: ProvenanceReport
): Promise<StoredProvenanceReport> {
  const result = await pool.query<StoredProvenanceReport>(
    `INSERT INTO provenance_reports (id, schema_version, content_hash, report, verification_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, schema_version, content_hash, report, verification_status, created_at`,
    [
      randomUUID(),
      report.schema_version,
      report.content_hash,
      report,
      STRUCTURALLY_VALID,
    ]
  );

  return result.rows[0];
}

export async function getProvenanceReport(
  pool: Pool,
  id: string
): Promise<StoredProvenanceReport | undefined> {
  const result = await pool.query<StoredProvenanceReport>(
    `SELECT id, schema_version, content_hash, report, verification_status, created_at
     FROM provenance_reports
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}
