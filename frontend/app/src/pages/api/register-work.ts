type NextApiRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

type NextApiResponse<T = unknown> = {
  status: (code: number) => NextApiResponse<T>
  json: (body: T) => NextApiResponse<T>
  setHeader: (name: string, value: string | string[]) => void
}

type Cadastro = {
  uuid?: unknown
  blake3_hash?: unknown
  c2pa_manifest?: unknown
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ARKHE_WRITE_API_KEY

  if (!apiKey) {
    return res.status(503).json({ error: 'Server unavailable' })
  }

  const corpo = req.body as Cadastro

  if (
    !corpo ||
    typeof corpo.uuid !== 'string' ||
    !UUID.test(corpo.uuid) ||
    typeof corpo.blake3_hash !== 'string' ||
    !corpo.blake3_hash ||
    !corpo.c2pa_manifest ||
    typeof corpo.c2pa_manifest !== 'object' ||
    Array.isArray(corpo.c2pa_manifest)
  ) {
    return res.status(400).json({ error: 'Payload inválido' })
  }

  try {
    const host = Array.isArray(req.headers.host)
      ? req.headers.host[0]
      : req.headers.host
    const origem = host ? `https://${host}` : 'http://localhost:3000'

    const resposta = await fetch(`${origem}/api/works`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        uuid: corpo.uuid,
        blake3_hash: corpo.blake3_hash,
        c2pa_manifest: corpo.c2pa_manifest,
      }),
    })

    const dados = await resposta.json().catch(() => ({
      error: 'Invalid API response',
    }))

    return res.status(resposta.status).json(dados)
  } catch {
    return res.status(502).json({ error: 'Works API unavailable' })
  }
}
