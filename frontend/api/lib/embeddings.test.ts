import { describe, expect, it, vi } from 'vitest';
import {
  EMBEDDING_DIMENSIONS,
  HuggingFaceEmbeddingProvider,
  parseFeatureExtractionResponse,
  validateEmbeddingText,
} from './embeddings';

const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) => index / 100);

describe('HuggingFaceEmbeddingProvider', () => {
  it('uses feature extraction and accepts the documented nested response', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([vector]),
    });
    const provider = new HuggingFaceEmbeddingProvider(
      'test-token',
      'https://example.test/feature-extraction',
      fetchImplementation
    );

    await expect(provider.embed('Arkhe provenance text')).resolves.toEqual(vector);
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://example.test/feature-extraction',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify({ inputs: 'Arkhe provenance text' }),
      })
    );
  });

  it('rejects a response with an invalid embedding dimension', () => {
    expect(() => parseFeatureExtractionResponse([[1, 2, 3]])).toThrow(
      `Embedding must contain exactly ${EMBEDDING_DIMENSIONS} finite numbers`
    );
  });

  it('rejects non-numeric embedding values', () => {
    const invalidVector = [...vector];
    invalidVector[10] = Number.NaN;

    expect(() => parseFeatureExtractionResponse([invalidVector])).toThrow();
  });

  it('fails safely when the provider request errors or times out', async () => {
    const failingProvider = new HuggingFaceEmbeddingProvider(
      'test-token',
      'https://example.test/feature-extraction',
      vi.fn().mockRejectedValue(new Error('network error'))
    );
    const timeoutProvider = new HuggingFaceEmbeddingProvider(
      'test-token',
      'https://example.test/feature-extraction',
      ((_: string, init: { signal: AbortSignal }) => new Promise<never>((_, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
      })) as never,
      1
    );

    await expect(failingProvider.embed('Arkhe provenance text')).rejects.toThrow(
      'Hugging Face embedding request failed'
    );
    await expect(timeoutProvider.embed('Arkhe provenance text')).rejects.toThrow(
      'Hugging Face embedding request timed out'
    );
  });

  it('rejects non-success responses from the provider', async () => {
    const provider = new HuggingFaceEmbeddingProvider(
      'test-token',
      'https://example.test/feature-extraction',
      vi.fn().mockResolvedValue({ ok: false, status: 429, json: vi.fn() })
    );

    await expect(provider.embed('Arkhe provenance text')).rejects.toThrow(
      'Hugging Face embedding request failed with status 429'
    );
  });

  it('rejects empty and oversized text before calling the provider', () => {
    expect(() => validateEmbeddingText('   ')).toThrow('Text for embedding cannot be empty');
    expect(() => validateEmbeddingText('a'.repeat(32_001))).toThrow('must not exceed');
  });
});
