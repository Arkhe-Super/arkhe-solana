import { afterEach, describe, expect, it } from 'vitest';
import { isWriteAuthorized } from './auth.js';

const originalApiKey = process.env.ARKHE_WRITE_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.ARKHE_WRITE_API_KEY;
  } else {
    process.env.ARKHE_WRITE_API_KEY = originalApiKey;
  }
});

describe('isWriteAuthorized', () => {
  it('accepts only the configured Bearer token', () => {
    process.env.ARKHE_WRITE_API_KEY = 'test-write-key';

    expect(isWriteAuthorized('Bearer test-write-key')).toBe(true);
    expect(isWriteAuthorized('Bearer invalid')).toBe(false);
    expect(isWriteAuthorized(undefined)).toBe(false);
    expect(isWriteAuthorized('Basic test-write-key')).toBe(false);
  });

  it('fails closed when the server key is not configured', () => {
    delete process.env.ARKHE_WRITE_API_KEY;

    expect(() => isWriteAuthorized('Bearer anything')).toThrow('ARKHE_WRITE_API_KEY is not configured');
  });
});
