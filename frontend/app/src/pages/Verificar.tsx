import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { buscarObraPorHash, type Obra } from '../dados'

type Resultado =
  | { tipo: 'vazio'; texto: string }
  | { tipo: 'encontrado'; registro: Obra }
  | { tipo: 'nao-encontrado' }

export default function Verificar() {
  const [escuro, setEscuro] = useState(
    localStorage.getItem('tema') !== 'claro'
  )

  useEffect(() => {
    document.body.classList.toggle('modo-escuro', escuro)
    document.body.classList.toggle('modo-claro', !escuro)
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
  }, [escuro])

  const inputRef = useRef<HTMLInputElement>(null)
  const arquivoAtual = useRef<File | null>(null)

  const [nome, setNome] = useState('Clique para escolher um arquivo')
  const [info, setInfo] = useState('ou arraste e solte aqui')
  const [hash, setHash] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const [resultado, setResultado] = useState<Resultado>({
    tipo: 'vazio',
    texto: 'Selecione um arquivo para iniciar a verificação.',
  })

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const gerarHash = async (arq: File) => {
    const buffer = await arq.arrayBuffer()
    const resultadoHash = await crypto.subtle.digest('SHA-256', buffer)
    return Array.from(new Uint8Array(resultadoHash))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  const processarArquivo = async (arq: File) => {
    arquivoAtual.current = arq
    setNome(arq.name)
    setInfo(formatarTamanho(arq.size) + ' · ' + (arq.type || 'tipo desconhecido'))
    setHash('')
    setResultado({ tipo: 'vazio', texto: 'Gerando impressão digital...' })

    try {
      const novoHash = await gerarHash(arq)
      if (arquivoAtual.current !== arq) return
      setHash(novoHash)
      setResultado({ tipo: 'vazio', texto: 'Arquivo pronto para verificação.' })
    } catch {
      setHash('')
      setResultado({
        tipo: 'vazio',
        texto: 'Não foi possível gerar a impressão digital.',
      })
    }
  }

  const verificar = () => {
    if (!hash) return

    setVerificando(true)
    setResultado({ tipo: 'vazio', texto: 'Verificando autenticidade...' })

    try {
      const registro = buscarObraPorHash(hash)
      if (registro) {
        setResultado({ tipo: 'encontrado', registro })
      } else {
        setResultado({ tipo: 'nao-encontrado' })
      }
    } catch {
      setResultado({
        tipo: 'vazio',
        texto: 'Não foi possível verificar o arquivo.',
      })
    } finally {
      setVerificando(false)
    }
  }

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
          <Link to="/verificar" className="item-nav-ml ativo">
            <span data-icone="verificar">Verificar</span>
          </Link>
          <Link to="/royalties" className="item-nav-ml">
            <span data-icone="royalties">Royalties</span>
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
          <h1>Verificação</h1>
        </header>

        <section className="conteudo-principal">
          <div className="grade-verificar">
            <div className="verif-coluna">
              <span className="titulo-arquivo-span">ENVIAR ARQUIVO</span>

              <input
                type="file"
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) processarArquivo(f)
                }}
              />

              <div
                className={'area-upload' + (arrastando ? ' arrastando' : '')}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setArrastando(true)
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setArrastando(false)
                  const f = e.dataTransfer.files[0]
                  if (f) processarArquivo(f)
                }}
              >
                <div className="icone-arquivo">📄</div>
                <strong>{nome}</strong>
                <span>{info}</span>
              </div>

              <button
                type="button"
                className="botao-principal"
                disabled={!hash || verificando}
                onClick={verificar}
              >
                {verificando ? 'Verificando...' : 'Verificar autenticidade'}
              </button>

              <div className="card-info">
                <p className="nota-privacidade">
                  O arquivo não sai do seu computador. Só a impressão digital é usada.
                </p>
              </div>

              <div className="card-info">
                <h3>Comparação precisa</h3>
                <p>
                  Compare a impressão digital do arquivo com um registro existente.
                </p>
              </div>
            </div>            <div className="verif-coluna">
              <span className="titulo-arquivo-span">RESULTADO DA VERIFICAÇÃO</span>

              <div className="area-resultado">
                {resultado.tipo === 'vazio' && (
                  <div className="resultado-vazio">
                    <div className="icone-resultado">⌕</div>
                    <p>{resultado.texto}</p>
                  </div>
                )}

                {resultado.tipo === 'encontrado' && (
                  <div className="card-resultado">
                    <div className="resultado-topo">
                      <div className="resultado-titulos">
                        <span className="rotulo-resultado">CORRESPONDÊNCIA EXATA</span>
                        <h2 className="titulo-resultado">Original registrado</h2>
                      </div>
                      <span className="selo-resultado">✓ AUTÊNTICO</span>
                    </div>

                    <div className="dados-resultado">
                      {[
                        ['Obra', resultado.registro.obra],
                        ['Autor', resultado.registro.autor],
                        ['Data do registro', resultado.registro.data],
                        ['Hash', resultado.registro.hash],
                        ['Blockchain', 'Solana'],
                      ].map(([rotulo, valor]) => (
                        <div className="dado" key={rotulo}>
                          <span className="dado-rotulo">{rotulo}</span>
                          <span className="dado-valor">{valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resultado.tipo === 'nao-encontrado' && (
                  <div className="card-resultado">
                    <div className="resultado-topo">
                      <div className="resultado-titulos">
                        <span className="rotulo-resultado">VERIFICAÇÃO</span>
                        <h2 className="titulo-resultado">Registro não encontrado</h2>
                      </div>
                      <a
                        href="#"
                        className="selo-resultado"
                        onClick={(e) => e.preventDefault()}
                      >
                        ✕ NÃO ENCONTRADO
                      </a>
                    </div>

                    <p className="nota-privacidade">
                      Nenhum registro corresponde à impressão digital deste arquivo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}