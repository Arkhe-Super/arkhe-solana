import { hash as blake3Hash } from 'blake3-wasm-rs';

export const ARKHE_PROOF_VERSION = 'arkhe-proof/v1' as const;
export const ARKHE_HASH_ALGORITHM = 'BLAKE3' as const;

export type ArkheProof = {
  version: typeof ARKHE_PROOF_VERSION;
  hashAlgorithm: typeof ARKHE_HASH_ALGORITHM;
  fileHash: string;
  wallet: string;
};

const HEX_256 = /^[a-f0-9]{64}$/;
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashFileWithBlake3(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return bytesToHex(blake3Hash(bytes));
}

export function createArkheProof(fileHash: string, wallet: string): ArkheProof {
  const normalizedHash = fileHash.toLowerCase();
  if (!HEX_256.test(normalizedHash)) {
    throw new Error('The file hash must be a 32-byte BLAKE3 hex digest.');
  }

  if (!wallet.trim()) {
    throw new Error('A connected wallet address is required.');
  }

  return {
    version: ARKHE_PROOF_VERSION,
    hashAlgorithm: ARKHE_HASH_ALGORITHM,
    fileHash: normalizedHash,
    wallet,
  };
}

export function serializeArkheProof(proof: ArkheProof): string {
  return JSON.stringify(proof);
}

export function parseArkheProof(value: string): ArkheProof | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;

    const proof = parsed as Partial<ArkheProof>;
    if (
      proof.version !== ARKHE_PROOF_VERSION ||
      proof.hashAlgorithm !== ARKHE_HASH_ALGORITHM ||
      typeof proof.fileHash !== 'string' ||
      !HEX_256.test(proof.fileHash) ||
      typeof proof.wallet !== 'string' ||
      !proof.wallet.trim()
    ) {
      return null;
    }

    return {
      version: proof.version,
      hashAlgorithm: proof.hashAlgorithm,
      fileHash: proof.fileHash,
      wallet: proof.wallet,
    };
  } catch {
    return null;
  }
}

export function decodeBase58(value: string): Uint8Array {
  if (!value) return new Uint8Array();

  const bytes = [0];
  for (const character of value) {
    const digit = BASE58.indexOf(character);
    if (digit < 0) throw new Error('Invalid base58 data.');

    let carry = digit;
    for (let index = 0; index < bytes.length; index += 1) {
      const current = bytes[index] * 58 + carry;
      bytes[index] = current & 0xff;
      carry = current >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (let index = 0; index < value.length - 1 && value[index] === '1'; index += 1) {
    bytes.push(0);
  }

  return new Uint8Array(bytes.reverse());
}

export function memoDataToProof(data: string): ArkheProof | null {
  try {
    return parseArkheProof(new TextDecoder().decode(decodeBase58(data)));
  } catch {
    return null;
  }
}
