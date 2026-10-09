export const EMBEDDING_MODEL = 'BAAI/bge-m3';
export const EMBEDDING_DIMENSIONS = 1024;
export const MAX_EMBEDDING_TEXT_LENGTH = 32_000;
export const EMBEDDING_REQUEST_TIMEOUT_MS = 15_000;

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type FetchImplementation = (
  input: string,
  init: { body: string; headers: Record<string, string>; method: string; signal: AbortSignal }
) => Promise<FetchResponse>;

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export class EmbeddingProviderError extends Error {
  constructor(message: string, readonly statusCode: 502 | 504 = 502) {
    super(message);
  }
}

export function validateEmbeddingText(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('Text for embedding must be a string');
  }

  const text = value.trim();
  if (!text) {
    throw new Error('Text for embedding cannot be empty');
  }

  if (text.length > MAX_EMBEDDING_TEXT_LENGTH) {
    throw new Error(`Text for embedding must not exceed ${MAX_EMBEDDING_TEXT_LENGTH} characters`);
  }

  return text;
}

export function validateEmbedding(value: unknown): number[] {
  if (
    !Array.isArray(value) ||
    value.length !== EMBEDDING_DIMENSIONS ||
    !value.every((item) => typeof item === 'number' && Number.isFinite(item))
  ) {
    throw new Error(`Embedding must contain exactly ${EMBEDDING_DIMENSIONS} finite numbers`);
  }

  return value;
}

export function parseFeatureExtractionResponse(value: unknown): number[] {
  if (Array.isArray(value) && value.length === 1 && Array.isArray(value[0])) {
    return validateEmbedding(value[0]);
  }

  return validateEmbedding(value);
}

export class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private readonly token: string,
    private readonly endpoint = `https://router.huggingface.co/hf-inference/models/${EMBEDDING_MODEL}`,
    private readonly fetchImplementation: FetchImplementation = fetch,
    private readonly timeoutMs = EMBEDDING_REQUEST_TIMEOUT_MS
  ) {}

  static fromEnvironment(): HuggingFaceEmbeddingProvider {
    const token = process.env.HF_TOKEN;

    if (!token) {
      throw new Error('HF_TOKEN is not configured');
    }

    return new HuggingFaceEmbeddingProvider(
      token,
      process.env.HF_INFERENCE_URL || undefined
    );
  }

  async embed(text: string): Promise<number[]> {
    const input = validateEmbeddingText(text);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: FetchResponse;
    try {
      response = await this.fetchImplementation(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: input }),
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) {
        throw new EmbeddingProviderError('Hugging Face embedding request timed out', 504);
      }

      throw new EmbeddingProviderError('Hugging Face embedding request failed');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new EmbeddingProviderError(`Hugging Face embedding request failed with status ${response.status}`);
    }

    try {
      return parseFeatureExtractionResponse(await response.json());
    } catch {
      throw new EmbeddingProviderError('Hugging Face returned an invalid embedding response');
    }
  }
}
