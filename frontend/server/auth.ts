import { timingSafeEqual } from 'node:crypto';

function getWriteApiKey(): string {
  const apiKey = process.env.ARKHE_WRITE_API_KEY;

  if (!apiKey) {
    throw new Error('ARKHE_WRITE_API_KEY is not configured');
  }

  return apiKey;
}

export function isWriteAuthorized(authorization: unknown): boolean {
  const expected = Buffer.from(getWriteApiKey());
  const token = typeof authorization === 'string'
    ? /^Bearer\s+(.+)$/.exec(authorization)?.[1] ?? ''
    : '';
  const provided = Buffer.from(token);
  const sameLength = provided.length === expected.length;
  const comparisonValue = sameLength ? provided : expected;

  return sameLength && timingSafeEqual(expected, comparisonValue);
}
