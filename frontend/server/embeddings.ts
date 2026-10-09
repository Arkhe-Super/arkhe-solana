export const EMBEDDING_MODEL = 'BAAI/bge-m3';
export const CLOUDFLARE_EMBEDDING_MODEL = '@cf/baai/bge-m3';
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

export function parseCloudflareEmbeddingResponse(value: unknown): number[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return validateEmbedding(value);
  }

  const result = (value as { result?: unknown }).result;
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return validateEmbedding(result);
  }

  const data = (result as { data?: unknown }).data;
  if (Array.isArray(data) && data.length === 1 && Array.isArray(data[0])) {
    return validateEmbedding(data[0]);
  }

  return validateEmbedding(data);
}

export class CloudflareEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private readonly token: string,
    accountId: string,
    private readonly fetchImplementation: FetchImplementation = fetch,
    private readonly timeoutMs = EMBEDDING_REQUEST_TIMEOUT_MS
  ) {
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${CLOUDFLARE_EMBEDDING_MODEL}`;
  }

  private readonly endpoint: string;

  static fromEnvironment(): CloudflareEmbeddingProvider {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!token) {
      throw new Error('CLOUDFLARE_API_TOKEN is not configured');
    }

    if (!accountId) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID is not configured');
    }

    return new CloudflareEmbeddingProvider(
      token,
      accountId
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
        body: JSON.stringify({ text: [input] }),
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) {
        throw new EmbeddingProviderError('Cloudflare embedding request timed out', 504);
      }

      throw new EmbeddingProviderError('Cloudflare embedding request failed');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new EmbeddingProviderError(`Cloudflare embedding request failed with status ${response.status}`);
    }

    try {
      return parseCloudflareEmbeddingResponse(await response.json());
    } catch {
      throw new EmbeddingProviderError('Cloudflare returned an invalid embedding response');
    }
  }
}
