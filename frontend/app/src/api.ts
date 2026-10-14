export type ManifestoObra = {
  titulo?: string
  autor?: string
  preco?: number
  arquivo?: string
  data?: string
  divisao?: Array<{
    nome: string
    percentual: number
  }>
  [chave: string]: unknown
}

export type ObraApi = {
  uuid: string
  blake3_hash: string | null
  c2pa_manifest: ManifestoObra
}

type RespostaObras = {
  status: 'ok'
  endpoint: string
  message: string
  works: ObraApi[]
}

type RespostaCadastro = {
  status: 'created'
  work: ObraApi
}

type ErroApi = {
  error?: string
  message?: string
}

async function chamarApi<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const headers = new Headers(opcoes.headers)

  if (opcoes.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const resposta = await fetch(caminho, {
    ...opcoes,
    headers,
  })

  const dados: unknown = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    const erro = dados as ErroApi | null
    throw new Error(
      erro?.error || erro?.message || `API respondeu ${resposta.status}`,
    )
  }

  return dados as T
}

// GET /api/works (público). Devolve no máximo 100 obras, ordenadas por uuid.
export const listarObras = () => chamarApi<RespostaObras>('/api/works')

// Procura entre as obras devolvidas por listarObras (limite de 100).
export const buscarObraPorHash = async (hash: string) => {
  const resposta = await listarObras()

  return (
    resposta.works.find(
      (obra) => obra.blake3_hash?.toLowerCase() === hash.toLowerCase(),
    ) ?? null
  )
}

// ATENÇÃO: o POST /api/works exige a chave de escrita (Bearer), que não pode
// ficar no navegador. Esta rota '/api/register-work' não está na documentação:
// confirme com o Eduardo qual rota o frontend deve usar para cadastrar.
export const registrarObra = (obra: {
  uuid: string
  blake3_hash: string
  c2pa_manifest: ManifestoObra
}) =>
  chamarApi<RespostaCadastro>('/api/register-work', {
    method: 'POST',
    body: JSON.stringify(obra),
  })