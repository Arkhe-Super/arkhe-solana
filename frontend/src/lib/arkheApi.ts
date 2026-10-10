export type Work = {
  uuid: string;
  blake3_hash: string | null;
  c2pa_manifest: Record<string, unknown>;
};

export type SimilarWork = {
  id: number;
  work_uuid: string;
  content_text: string;
  model: string;
  created_at: string;
  cosine_distance: number;
};

type WorksResponse = {
  status: 'ok';
  works: Work[];
};

type SearchResponse = {
  status: 'ok';
  matches: SimilarWork[];
};

export class ArkheApiError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ArkheApiError';
    this.status = status;
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return fallback;
}

export async function getWorks(): Promise<Work[]> {
  const response = await fetch('/api/works');
  const body = await readJson(response);

  if (!response.ok) {
    throw new ArkheApiError(errorMessage(body, 'Não foi possível consultar as obras.'), response.status);
  }

  if (!body || typeof body !== 'object' || !Array.isArray((body as Partial<WorksResponse>).works)) {
    throw new ArkheApiError('A API retornou uma lista de obras inválida.');
  }

  return (body as WorksResponse).works;
}

export async function searchWorks(query: string, limit = 10): Promise<SimilarWork[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    throw new ArkheApiError('Informe um texto para pesquisar.');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ArkheApiError('O limite de resultados deve estar entre 1 e 100.');
  }

  const response = await fetch('/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'search', query: normalizedQuery, limit }),
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new ArkheApiError(errorMessage(body, 'Não foi possível realizar a busca semântica.'), response.status);
  }

  if (!body || typeof body !== 'object' || !Array.isArray((body as Partial<SearchResponse>).matches)) {
    throw new ArkheApiError('A API retornou resultados de busca inválidos.');
  }

  return (body as SearchResponse).matches;
}
