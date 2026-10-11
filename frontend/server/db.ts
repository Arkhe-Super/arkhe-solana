import { Pool } from 'pg';

let pool: Pool | undefined;

const DATABASE_UNAVAILABLE_CODES = new Set([
  '08001',
  '08006',
  '28P01',
  '3D000',
  '57P03',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
]);

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (error instanceof Error && error.message === 'DATABASE_URL is not configured') {
    return true;
  }

  const code = (error as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' && DATABASE_UNAVAILABLE_CODES.has(code);
}

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  pool ??= new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    // Neon can need a few seconds to wake a suspended compute endpoint.
    // Keep this bounded for Vercel functions while avoiding false failures
    // during a cold connection.
    connectionTimeoutMillis: 10_000,
  });
  return pool;
}
