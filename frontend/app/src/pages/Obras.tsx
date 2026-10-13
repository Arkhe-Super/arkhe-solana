import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWorks, type Work } from '../../../src/lib/arkheApi'

// Mude para true para ver só os exemplos, sem chamar a API.
const FORCAR_EXEMPLOS = false

// Exemplos temporários: apague quando a API e o banco estiverem funcionando.
const EXEMPLOS: Work[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    blake3_hash: null,
    c2pa_manifest: { title: 'Obra de exemplo 1', artist: 'Artista A' },
  },
  {
    uuid: '660e8400-e29b-41d4-a716-446655440000',
    blake3_hash: 'b3a1f0c2e4d5a6b7c8d9e0f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5',
    c2pa_manifest: { title: 'Obra de exemplo 2', artist: 'Artista B' },
  },
]

// Título e autor dependem do que for guardado dentro do manifest.
function textoDoManifest(work: Work, chave: string, padrao: string): string {
  const valor = work.c2pa_manifest?.[chave]
  return typeof valor === 'string' && valor.trim() ? valor : padrao
}

function encurtar(texto: string, tamanho = 16): string {
  return texto.length > tamanho ? `${texto.slice(0, tamanho)}…` : texto
}

export default function Obras() {
  const [obras, setObras] = useState<Work[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aviso, setAviso] = useState('')
  const [escuro, setEscuro] = useState(true)

  useEffect(() => {
    if (FORCAR_EXEMPLOS) {
      setObras(EXEMPLOS)
      setAviso('Exibindo obras de exemplo.')
      setCarregando(false)
      return
    }

    getWorks()
      .then((lista) => setObras(lista))
      .catch((erro: unknown) => {
        const motivo = erro instanceof Error ? erro.message : 'erro desconhecido'
        setObras(EXEMPLOS)
        setAviso(`Não foi possível carregar da API (${motivo}). Exibindo obras de exemplo.`)
      })
      .finally(() => setCarregando(false))
  }, [])

  return (
    <div className="container-menu">
      <aside className="container-menu-lateral">
        <div className="itens-menu-lateral">
          <span id="span-icone">A</span>
          <span id="span-arkhe">ARKHE</span>
        </div>

        <nav className="nav-lateral">
          <Link to="/registrar" className="item-nav-ml">
            <span data-icone="registrar">Registrar Obra</span>
          </Link>
          <Link to="/verificar" className="item-nav-ml">
            <span data-icone="verificar">Verificar</span>
          </Link>
          <Link to="/royalties" className="item-nav-ml">
            <span data-icone="royalties">Royalties</span>
          </Link>
          <Link to="/obras" className="item-nav-ml ativo">
            <span>Obras</span>
          </Link>
        </nav>

        <label className="modo-escuro-menu" htmlFor="switch">
          <span>Modo escuro</span>
          <input
            type="checkbox"
            id="switch"
            checked={escuro}
            onChange={(e) => setEscuro(e.target.checked)}
          />
          <span className="switch"></span>
        </label>
      </aside>

      <main className="main-menu-principal">
        <header className="hader-menu-principal">
          <h1>Obras</h1>
          <p>Obras registradas na plataforma</p>
        </header>

        {aviso && <p>{aviso}</p>}
        {carregando && <p>Carregando obras...</p>}
        {!carregando && obras.length === 0 && <p>Nenhuma obra registrada ainda.</p>}

        {obras.map((obra) => (
          <div className="card-documento" key={obra.uuid}>
            <h2 className="titulo-arquivo-span">
              {textoDoManifest(obra, 'title', 'Obra sem título')}
            </h2>
            <p>Autor: {textoDoManifest(obra, 'artist', 'Não informado')}</p>
            <p>
              Hash:{' '}
              <span className="valor-hash">
                {obra.blake3_hash ? encurtar(obra.blake3_hash) : 'Sem hash'}
              </span>
            </p>
            <p>ID: {encurtar(obra.uuid, 8)}</p>
          </div>
        ))}
      </main>
    </div>
  )
}