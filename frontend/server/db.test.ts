import { describe, expect, it } from 'vitest';

import { isDatabaseUnavailableError } from './db.js';

describe('isDatabaseUnavailableError', () => {
  it('recognizes missing configuration and expected PostgreSQL or network availability failures', () => {
    expect(isDatabaseUnavailableError(new Error('DATABASE_URL is not configured'))).toBe(true);
    expect(isDatabaseUnavailableError({ code: '28P01' })).toBe(true);
    expect(isDatabaseUnavailableError({ code: 'ETIMEDOUT' })).toBe(true);
  });

  it('does not classify an unknown database error as unavailable', () => {
    expect(isDatabaseUnavailableError({ code: '42P01' })).toBe(false);
  });
});
