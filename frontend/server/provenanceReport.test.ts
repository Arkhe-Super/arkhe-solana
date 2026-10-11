import { describe, expect, it } from 'vitest';

import { validProvenanceReport } from './provenanceReport.fixture.js';
import { validateProvenanceReport } from './provenanceReport.js';

describe('validateProvenanceReport', () => {
  it('accepts a structurally valid v1.1 report', () => {
    expect(validateProvenanceReport(validProvenanceReport())).toMatchObject({ success: true });
  });

  it('rejects invalid reports without claiming cryptographic verification', () => {
    const report = validProvenanceReport();
    report.content_hash = 'not-a-hash';

    expect(validateProvenanceReport(report)).toEqual({
      success: false,
      errors: expect.arrayContaining(['content_hash must be lowercase SHA-256 hex']),
    });
  });
});
