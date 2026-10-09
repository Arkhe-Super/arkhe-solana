import { describe, expect, it, vi } from 'vitest';
import {
  EMBEDDING_DIMENSIONS,
  CloudflareEmbeddingProvider,
  parseCloudflareEmbeddingResponse,
  validateEmbeddingText,
} from './embeddings.js';

const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) => index / 100);

describe('CloudflareEmbeddingProvider', () => {
  it('uses the Workers AI REST API and accepts its embedding response', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true, result: { data: [vector] } }),
    });
    const provider = new CloudflareEmbeddingProvider(
      'test-token',
      'test-account',
      fetchImplementation
    );

    await expect(provider.embed('Arkhe provenance text')).resolves.toEqual(vector);
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://api.cloudflare.com/client/v4/accounts/test-account/ai/run/@cf/baai/bge-m3',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify({ text: ['Arkhe provenance text'] }),
      })
    );
  });

  it('rejects a response with an invalid embedding dimension', () => {
    expect(() => parseCloudflareEmbeddingResponse({ result: { data: [[1, 2, 3]] } })).toThrow(
      `Embedding must contain exactly ${EMBEDDING_DIMENSIONS} finite numbers`
    );
  });

  it('rejects non-numeric embedding values', () => {
    const invalidVector = [...vector];
    invalidVector[10] = Number.NaN;

    expect(() => parseCloudflareEmbeddingResponse({ result: { data: [invalidVector] } })).toThrow();
  });

  it('fails safely when the provider request errors or times out', async () => {
    const failingProvider = new CloudflareEmbeddingProvider(
      'test-token',
      'test-account',
      vi.fn().mockRejectedValue(new Error('network error'))
    );
    const timeoutProvider = new CloudflareEmbeddingProvider(
      'test-token',
      'test-account',
      ((_: string, init: { signal: AbortSignal }) => new Promise<never>((_, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
      })) as never,
      1
    );

    await expect(failingProvider.embed('Arkhe provenance text')).rejects.toThrow(
      'Cloudflare embedding request failed'
    );
    await expect(timeoutProvider.embed('Arkhe provenance text')).rejects.toThrow(
      'Cloudflare embedding request timed out'
    );
  });

  it('rejects non-success responses from the provider', async () => {
    const provider = new CloudflareEmbeddingProvider(
      'test-token',
      'test-account',
      vi.fn().mockResolvedValue({ ok: false, status: 429, json: vi.fn() })
    );

    await expect(provider.embed('Arkhe provenance text')).rejects.toThrow(
      'Cloudflare embedding request failed with status 429'
    );
  });

  it('rejects empty and oversized text before calling the provider', () => {
    expect(() => validateEmbeddingText('   ')).toThrow('Text for embedding cannot be empty');
    expect(() => validateEmbeddingText('a'.repeat(32_001))).toThrow('must not exceed');
  });
});
