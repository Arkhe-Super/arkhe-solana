import { describe, expect, it, vi } from 'vitest';
import { getInjectedWallet, verifyArkheMemoProof } from './solanaDevnet';

describe('Devnet wallet detection', () => {
  it('reports no wallet rather than fabricating one', () => {
    vi.stubGlobal('window', {});
    expect(getInjectedWallet()).toBeNull();
    vi.unstubAllGlobals();
  });

  it('rejects an empty transaction signature before querying the network', async () => {
    await expect(verifyArkheMemoProof('', 'a'.repeat(64))).rejects.toThrow('transaction signature');
  });
});
