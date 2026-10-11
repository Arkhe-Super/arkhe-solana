import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { adicionarObra, buscarObraPorHash } from '../dados'

type Beneficiario = {
  id: number
  nome: string
  percentual: number
}

export default function Registrar() {
  const [escuro, setEscuro] = useState(
    localStorage.getItem('tema') !== 'claro'
  )

  useEffect(() => {
    document.body.classList.toggle('modo-escuro', escuro)
    document.body.classList.toggle('modo-claro', !escuro)
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
  }, [escuro])

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [nomeArquivo, setNomeArquivo] = useState('Clique para escolher um arquivo')
  const [infoArquivo, setInfoArquivo] = useState('ou arraste e solte aqui')
  const [hash, setHash] = useState('Escolha um arquivo para gerar')
  const [arrastando, setArrastando] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [preco, setPreco] = useState('')
  const [registrando, setRegistrando] = useState(false)

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const gerarHash = async (arq: File) => {
    const buffer = await arq.arrayBuffer()
    const resultado = await crypto.subtle.digest('SHA-256', buffer)
    return Array.from(new Uint8Array(resultado))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  const processarArquivo = async (arq: File) => {
    setArquivo(arq)
    setNomeArquivo(arq.name)
    setInfoArquivo(formatarTamanho(arq.size) + ' · ' + (arq.type || 'tipo desconhecido'))
    setHash('Gerando impressão digital...')

    try {
      setHash(await gerarHash(arq))
    } catch {
      setHash('Não foi possível gerar a impressão digital.')
    }
  }

  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([
    { id: 1, nome: '', percentual: 0 },
  ])

  const adicionarBeneficiario = () => {
    setBeneficiarios([
      ...beneficiarios,
      { id: Date.now(), nome: '', percentual: 0 },
    ])
  }

  const removerBeneficiario = (id: number) => {
    setBeneficiarios(beneficiarios.filter((b) => b.id !== id))
  }

  const mudarNome = (id: number, nome: string) => {
    setBeneficiarios(
      beneficiarios.map((b) => (b.id === id ? { ...b, nome } : b))
    )
  }

  const mudarPercentual = (id: number, percentual: number) => {
    setBeneficiarios(
      beneficiarios.map((b) => (b.id === id ? { ...b, percentual } : b))
    )
  }

  const soma =
    Math.round(beneficiarios.reduce((total, b) => total + b.percentual, 0) * 100) / 100

  let classeSoma = 'soma-benef'
  let textoSoma = ''

  if (beneficiarios.length > 0) {
    if (soma === 100) {
      classeSoma += ' valida'
      textoSoma = 'Distribuição válida · 100%'
    } else {
      classeSoma += ' invalida'
      textoSoma = 'A soma precisa ser 100% (atual: ' + soma + '%)'
    }
  }

  const registrarObra = async () => {
    if (!arquivo) {
      alert('Selecione o arquivo da obra.')
      return
    }
    if (!titulo.trim()) {
      alert('Informe o título da obra.')
      return
    }
    if (!autor.trim()) {
      alert('Informe o autor da obra.')
      return
    }
    if (!preco) {
      alert('Informe o preço da licença.')
      return
    }

    setRegistrando(true)

    try {
      const hashArquivo = await gerarHash(arquivo)

      const divisao = beneficiarios.map((b) => ({
        nome: b.nome.trim() || 'Sem nome',
        percentual: b.percentual,
      }))

      if (soma !== 100) {
        alert('A soma da divisão precisa ser 100%.')
        return
      }

      if (buscarObraPorHash(hashArquivo)) {
        alert('Este arquivo já foi registrado.')
        return
      }

      adicionarObra({
        obra: titulo.trim(),
        autor: autor.trim(),
        preco: Number(preco),
        hash: hashArquivo,
        arquivo: arquivo.name,
        data: new Date().toISOString().slice(0, 10),
        divisao,
      })

      alert('Obra registrada!')
    } catch (erro) {
      console.error(erro)
      alert('Não foi possível preparar o registro.')
    } finally {
      setRegistrando(false)
    }
  }

  return (
    <div className="body-principal">
      <div className="container-menu">
        <aside className="container-menu-lateral">
          <div className="itens-menu-lateral">
            <span id="span-icone">A</span>
            <span id="span-arkhe">ARKHE</span>
          </div>

                    <nav className="nav-lateral">
            <Link to="/registrar" className="item-nav-ml ativo">
              <span data-icone="registrar">Registrar Obra</span>
            </Link>
            <Link to="/verificar" className="item-nav-ml">
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
            <h1>Registrar Obra</h1>
            <p>Crie um registro de autoria da Solana</p>
          </header>

          <div className="menu-grid">
            <div className="coluna-arquivo">
              <span className="titulo-arquivo-span">ARQUIVO DA OBRA</span> <br />

              <section className="card-documento">
                <div className="card-arquivo">
                  <input
                    type="file"
                    id="arquivo"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) processarArquivo(f)
                    }}
                  />
                  <label
                    htmlFor="arquivo"
                    className={'area-upload' + (arrastando ? ' arrastando' : '')}
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
                    <strong id="nome-arquivo">{nomeArquivo}</strong>
                    <span id="info-arquivo">{infoArquivo}</span>
                  </label>
                </div>
              </section>

              <section className="card-impressao">
                <span className="texto-card-impressao">Impressão Digital</span>
                <p className="valor-hash">{hash}</p>
              </section>

              <section className="card-hash">
                <span className="texto-card-hash">
                  O hash será registrado exclusivamente na Solana.
                </span>
              </section>
            </div>            <div className="coluna-formulario">
              <form className="card-formulario">
                <span className="titulo-arquivo-span">DADOS DO REGISTRO</span>

                <div className="linha-campos">
                  <div className="campo">
                    <label className="label-formulario" htmlFor="titulo">Título</label>
                    <input
                      className="input-formulario"
                      id="titulo"
                      type="text"
                      placeholder="Titulo da obra"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </div>

                  <div className="campo">
                    <label className="label-formulario" htmlFor="autor">Autor</label>
                    <input
                      className="input-formulario"
                      id="autor"
                      type="text"
                      placeholder="Nome do autor"
                      value={autor}
                      onChange={(e) => setAutor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="linha-campos">
                  <div className="campo">
                    <label className="label-formulario" htmlFor="preco">Preço da licença</label>
                    <input
                      className="input-formulario"
                      id="preco"
                      type="number"
                      min="1"
                      placeholder="0,00"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                    />
                  </div>
                </div>
              </form>

              <hr />

              <div className="benef-topo">
                <div>
                  <h2 className="titulo-beneficios">BENEFICIÁRIOS</h2>
                  <p className="benef-descricao">
                    Defina a divisão automática dos royalties
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-adicionar"
                  className="botao-texto"
                  onClick={adicionarBeneficiario}
                >
                  + Adicionar
                </button>
              </div>

              <div id="lista-beneficiarios">
                {beneficiarios.map((b) => (
                  <div className="benef-linha" key={b.id}>
                    <input
                      className="input-formulario benef-nome"
                      type="text"
                      placeholder="Nome do Estúdio"
                      value={b.nome}
                      onChange={(e) => mudarNome(b.id, e.target.value)}
                    />

                    <div className="benef-percentual">
                      <input
                        className="input-formulario"
                        type="number"
                        min="0"
                        max="100"
                        value={b.percentual}
                        onChange={(e) =>
                          mudarPercentual(b.id, Number(e.target.value) || 0)
                        }
                      />
                      <span>%</span>
                    </div>

                    <button
                      type="button"
                      className="btn-remover"
                      aria-label="Remover beneficiário"
                      onClick={() => removerBeneficiario(b.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div id="benef-resumo-soma" className={classeSoma}>
                {textoSoma}
              </div>

              <div className="card-btn">
                <button
                  type="button"
                  id="btn-registrar"
                  className="botao-registrar"
                  onClick={registrarObra}
                  disabled={registrando}
                >
                  {registrando ? 'Preparando registro...' : '⭢ Registrar obra'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}