import { Pool } from 'pg';

let pool: Pool | undefined;

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
