import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listarObras } from '../api'

type ObraApi = {
  uuid: string
  blake3_hash: string | null
  c2pa_manifest: Record<string, unknown>
}

const hashCurto = (h: string) => `${h.slice(0, 4)}...${h.slice(-4)}`

export default function Obras() {
  const [escuro, setEscuro] = useState(
    localStorage.getItem('tema') !== 'claro'
  )

  useEffect(() => {
    document.body.classList.toggle('modo-escuro', escuro)
    document.body.classList.toggle('modo-claro', !escuro)
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
  }, [escuro])

  const [obras, setObras] = useState<ObraApi[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)


  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await listarObras()
        console.log('Resposta da API:', dados)
        setObras(dados.works ?? [])
      } catch (e) {
      setErro(
      e instanceof Error
      ? e.message
      : 'Não foi possível carregar as obras.',
      )
      }
     finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

 const mostrarVazio = !carregando && !erro && obras.length === 0


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
            <span data-icone="registrar">Obras</span>
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
          <p>Obras registradas na API</p>
        </header>

        <div id="lista-pagamentos">
          {carregando && <p className="lista-vazia">Carregando obras...</p>}

          {erro && <p className="lista-vazia">{erro}</p>}

          {mostrarVazio && (
            <p className="lista-vazia">Nenhuma obra cadastrada ainda.</p>
          )}

          {obras.map((o) => (
            <section className="pagamentos" key={o.uuid}>
              <div className="royalties-linha">
                <div className="pagamento-topo">
                  <span className="pagamento-icone">♪</span>

                  <div className="pagamento-obra">
                    <strong>{hashCurto(o.uuid)}</strong>
                    <small>UUID da obra</small>
                  </div>

                  <span className="pagamento-tx">
                    {o.blake3_hash ? hashCurto(o.blake3_hash) : 'Sem hash'}
                  </span>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}