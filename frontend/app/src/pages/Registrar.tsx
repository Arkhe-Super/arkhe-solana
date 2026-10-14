import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { blake3 } from 'hash-wasm'
import { buscarObraPorHash, registrarObra } from '../api'

type Beneficiario = {
  id: number
  nome: string
  percentual: number
}

export default function Registrar() {
  const [escuro, setEscuro] = useState(
    localStorage.getItem('tema') !== 'claro',
  )

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [nomeArquivo, setNomeArquivo] = useState(
    'Clique para escolher um arquivo',
  )
  const [infoArquivo, setInfoArquivo] = useState(
    'ou arraste e solte aqui',
  )
  const [hash, setHash] = useState(
    'Escolha um arquivo para gerar',
  )
  const [arrastando, setArrastando] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [preco, setPreco] = useState('')
  const [registrando, setRegistrando] = useState(false)

  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([
    {
      id: 1,
      nome: '',
      percentual: 0,
    },
  ])

  useEffect(() => {
    document.body.classList.toggle('modo-escuro', escuro)
    document.body.classList.toggle('modo-claro', !escuro)
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
  }, [escuro])

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const gerarHash = async (arq: File) => {
    const buffer = await arq.arrayBuffer()
    return blake3(new Uint8Array(buffer))
  }

  const processarArquivo = async (arq: File) => {
    setArquivo(arq)
    setNomeArquivo(arq.name)
    setInfoArquivo(
      `${formatarTamanho(arq.size)} - ${
        arq.type || 'tipo desconhecido'
      }`,
    )
    setHash('Gerando impressão digital...')

    try {
      const hashGerado = await gerarHash(arq)
      setHash(hashGerado)
    } catch (erro) {
      console.error(erro)
      setHash('Não foi possível gerar a impressão digital.')
    }
  }

  const adicionarBeneficiario = () => {
    setBeneficiarios((atuais) => [
      ...atuais,
      {
        id: Date.now(),
        nome: '',
        percentual: 0,
      },
    ])
  }

  const removerBeneficiario = (id: number) => {
    setBeneficiarios((atuais) =>
      atuais.filter((beneficiario) => beneficiario.id !== id),
    )
  }

  const mudarNome = (id: number, nome: string) => {
    setBeneficiarios((atuais) =>
      atuais.map((beneficiario) =>
        beneficiario.id === id
          ? { ...beneficiario, nome }
          : beneficiario,
      ),
    )
  }

  const mudarPercentual = (
    id: number,
    percentual: number,
  ) => {
    setBeneficiarios((atuais) =>
      atuais.map((beneficiario) =>
        beneficiario.id === id
          ? { ...beneficiario, percentual }
          : beneficiario,
      ),
    )
  }

  const soma =
    Math.round(
      beneficiarios.reduce(
        (total, beneficiario) =>
          total + beneficiario.percentual,
        0,
      ) * 100,
    ) / 100

  let classeSoma = 'soma-benef'
  let textoSoma = ''

  if (beneficiarios.length > 0) {
    if (soma === 100) {
      classeSoma += ' valida'
      textoSoma = 'Distribuição válida - 100%'
    } else {
      classeSoma += ' invalida'
      textoSoma = `A soma precisa ser 100% (atual: ${soma}%)`
    }
  }

  const registrar = async () => {
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

    const precoNumerico = Number(preco)

    if (!preco || !Number.isFinite(precoNumerico) || precoNumerico <= 0) {
      alert('Informe um preço válido para a licença.')
      return
    }

    if (soma !== 100) {
      alert('A soma da divisão precisa ser 100%.')
      return
    }

    setRegistrando(true)

    try {
      const hashArquivo = await gerarHash(arquivo)
      const obraExistente = await buscarObraPorHash(hashArquivo)

      if (obraExistente) {
        alert('Este arquivo já foi registrado.')
        return
      }

      const divisao = beneficiarios.map((beneficiario) => ({
        nome: beneficiario.nome.trim() || 'Sem nome',
        percentual: beneficiario.percentual,
      }))

      await registrarObra({
        uuid: crypto.randomUUID(),
        blake3_hash: hashArquivo,
        c2pa_manifest: {
          titulo: titulo.trim(),
          autor: autor.trim(),
          preco: precoNumerico,
          arquivo: arquivo.name,
          data: new Date().toISOString(),
          divisao,
        },
      })

      setHash(hashArquivo)
      alert('Obra registrada!')
    } catch (erro) {
      console.error(erro)

      alert(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível registrar a obra.',
      )
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
            <Link
              to="/registrar"
              className="item-nav-ml ativo"
            >
              <span data-icone="registrar">Registrar Obra</span>
            </Link>

            <Link to="/verificar" className="item-nav-ml">
              <span data-icone="verificar">Verificar</span>
            </Link>

            <Link to="/royalties" className="item-nav-ml">
              <span data-icone="royalties">Royalties</span>
            </Link>

            <Link to="/obras" className="item-nav-ml">
              <span data-icone="registrar">Obras</span>
            </Link>
          </nav>

          <label className="modo-escuro-menu" htmlFor="switch">
            <span>Modo escuro</span>

            <input
              type="checkbox"
              id="switch"
              checked={escuro}
              onChange={(evento) =>
                setEscuro(evento.target.checked)
              }
            />

            <span className="switch" />
          </label>
        </aside>

        <main className="main-menu-principal">
          <header className="hader-menu-principal">
            <h1>Registrar Obra</h1>
            <p>Crie um registro de autoria da Solana</p>
          </header>

          <div className="menu-grid">
            <div className="coluna-arquivo">
              <span className="titulo-arquivo-span">
                ARQUIVO DA OBRA
              </span>

              <section className="card-documento">
                <div className="card-arquivo">
                  <input
                    type="file"
                    id="arquivo"
                    hidden
                    onChange={(evento) => {
                      const arquivoSelecionado =
                        evento.target.files?.[0]

                      if (arquivoSelecionado) {
                        void processarArquivo(arquivoSelecionado)
                      }
                    }}
                  />

                  <label
                    htmlFor="arquivo"
                    className={
                      `area-upload${
                        arrastando ? ' arrastando' : ''
                      }`
                    }
                    onDragOver={(evento) => {
                      evento.preventDefault()
                      setArrastando(true)
                    }}
                    onDragLeave={() => setArrastando(false)}
                    onDrop={(evento) => {
                      evento.preventDefault()
                      setArrastando(false)

                      const arquivoSolto =
                        evento.dataTransfer.files[0]

                      if (arquivoSolto) {
                        void processarArquivo(arquivoSolto)
                      }
                    }}
                  >
                    <div className="icone-arquivo">📄</div>

                    <strong id="nome-arquivo">
                      {nomeArquivo}
                    </strong>

                    <span id="info-arquivo">
                      {infoArquivo}
                    </span>
                  </label>
                </div>
              </section>

              <section className="card-impressao">
                <span className="texto-card-impressao">
                  Impressão Digital
                </span>

                <p className="valor-hash">{hash}</p>
              </section>

              <section className="card-hash">
                <span className="texto-card-hash">
                  O hash será registrado exclusivamente na Solana.
                </span>
              </section>
            </div>

            <div className="coluna-formulario">
              <form
                className="card-formulario"
                onSubmit={(evento) => evento.preventDefault()}
              >
                <span className="titulo-arquivo-span">
                  DADOS DO REGISTRO
                </span>

                <div className="linha-campos">
                  <div className="campo">
                    <label
                      className="label-formulario"
                      htmlFor="titulo"
                    >
                      Título
                    </label>

                    <input
                      className="input-formulario"
                      id="titulo"
                      type="text"
                      placeholder="Título da obra"
                      value={titulo}
                      onChange={(evento) =>
                        setTitulo(evento.target.value)
                      }
                    />
                  </div>

                  <div className="campo">
                    <label
                      className="label-formulario"
                      htmlFor="autor"
                    >
                      Autor
                    </label>

                    <input
                      className="input-formulario"
                      id="autor"
                      type="text"
                      placeholder="Nome do autor"
                      value={autor}
                      onChange={(evento) =>
                        setAutor(evento.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="linha-campos">
                  <div className="campo">
                    <label
                      className="label-formulario"
                      htmlFor="preco"
                    >
                      Preço da licença
                    </label>

                    <input
                      className="input-formulario"
                      id="preco"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0,00"
                      value={preco}
                      onChange={(evento) =>
                        setPreco(evento.target.value)
                      }
                    />
                  </div>
                </div>
              </form>

              <hr />

              <div className="benef-topo">
                <div>
                  <h2 className="titulo-beneficios">
                    BENEFICIÁRIOS
                  </h2>

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
                {beneficiarios.map((beneficiario) => (
                  <div
                    className="benef-linha"
                    key={beneficiario.id}
                  >
                    <input
                      className="input-formulario benef-nome"
                      type="text"
                      placeholder="Nome do Estúdio"
                      value={beneficiario.nome}
                      onChange={(evento) =>
                        mudarNome(
                          beneficiario.id,
                          evento.target.value,
                        )
                      }
                    />

                    <div className="benef-percentual">
                      <input
                        className="input-formulario"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={beneficiario.percentual}
                        onChange={(evento) =>
                          mudarPercentual(
                            beneficiario.id,
                            Number(evento.target.value) || 0,
                          )
                        }
                      />

                      <span>%</span>
                    </div>

                    <button
                      type="button"
                      className="btn-remover"
                      aria-label="Remover beneficiário"
                      onClick={() =>
                        removerBeneficiario(beneficiario.id)
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div
                id="benef-resumo-soma"
                className={classeSoma}
              >
                {textoSoma}
              </div>

              <div className="card-btn">
                <button
                  type="button"
                  id="btn-registrar"
                  className="botao-registrar"
                  onClick={() => void registrar()}
                  disabled={registrando}
                >
                  {registrando
                    ? 'Registrando...'
                    : '⭢ Registrar obra'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
