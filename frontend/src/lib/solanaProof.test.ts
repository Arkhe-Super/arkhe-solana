import { describe, expect, it } from 'vitest';
import {
  ARKHE_HASH_ALGORITHM,
  ARKHE_PROOF_VERSION,
  createArkheProof,
  decodeBase58,
  hashFileWithBlake3,
  memoDataToProof,
  parseArkheProof,
  serializeArkheProof,
} from './solanaProof';

describe('Arkhe proof format', () => {
  it('hashes a file with a deterministic BLAKE3-256 digest', async () => {
    const digest = await hashFileWithBlake3(new Blob(['abc']));
    expect(digest).toBe('6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85');
  });

  it('round-trips the documented versioned proof payload', () => {
    const proof = createArkheProof('a'.repeat(64), 'FEEpayer111111111111111111111111111111111');
    expect(parseArkheProof(serializeArkheProof(proof))).toEqual({
      version: ARKHE_PROOF_VERSION,
      hashAlgorithm: ARKHE_HASH_ALGORITHM,
      fileHash: 'a'.repeat(64),
      wallet: 'FEEpayer111111111111111111111111111111111',
    });
  });

  it('rejects malformed proof data and invalid base58', () => {
    expect(parseArkheProof('{"version":"arkhe-proof/v1"}')).toBeNull();
    expect(() => createArkheProof('not-a-hash', 'wallet')).toThrow(/BLAKE3/);
    expect(() => decodeBase58('0')).toThrow(/base58/);
  });

  it('does not accept arbitrary memo data as an Arkhe proof', () => {
    expect(memoDataToProof('1')).toBeNull();
  });
});
