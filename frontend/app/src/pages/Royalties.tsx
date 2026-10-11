import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { lerDados, salvarDados, simularPagamento } from '../dados'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const dinheiro = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia} ${MESES[Number(mes) - 1]} ${ano}`
}

const iniciais = (nome: string) =>
  nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

const hashCurto = (h: string) => `${h.slice(0, 4)}...${h.slice(-4)}`

const carregarPagamentos = () =>
  lerDados().pagamentos.sort((a, b) => b.data.localeCompare(a.data))

const celula = (valor: string | number) =>
  `"${String(valor).replaceAll('"', '""')}"`

const numeroBR = (n: number) => n.toFixed(2).replace('.', ',')

export default function Royalties() {
  const [escuro, setEscuro] = useState(
    localStorage.getItem('tema') !== 'claro'
  )

  useEffect(() => {
    document.body.classList.toggle('modo-escuro', escuro)
    document.body.classList.toggle('modo-claro', !escuro)
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
  }, [escuro])

  const [pagamentos, setPagamentos] = useState(carregarPagamentos)
  const [obras] = useState(() => lerDados().obras)
  const [obraSel, setObraSel] = useState(obras[0]?.hash ?? '')
  const [licenciado, setLicenciado] = useState('')

  let totalMes = 0
  if (pagamentos.length > 0) {
    const mesAtual = pagamentos[0].data.slice(0, 7)
    totalMes = pagamentos
      .filter((p) => p.data.startsWith(mesAtual))
      .reduce((soma, p) => soma + p.valor, 0)
  }
  const quantidade = String(pagamentos.length).padStart(2, '0')

  const exportarCSV = () => {
    const linhas = [
      ['Data', 'Obra', 'Licenciado', 'Valor (USDC)', 'Beneficiário', 'Percentual', 'Parte (USDC)', 'Transação'],
    ]

    pagamentos.forEach((p) => {
      p.divisao.forEach((b) => {
        linhas.push([
          p.data,
          p.obra,
          p.licenciado,
          numeroBR(p.valor),
          b.nome,
          `${b.percentual}%`,
          numeroBR((p.valor * b.percentual) / 100),
          p.assinatura,
        ])
      })
    })

    const csv = '\ufeff' + linhas.map((l) => l.map(celula).join(';')).join('\n')
    const arquivo = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(arquivo)
    const link = document.createElement('a')
    link.href = url
    link.download = 'royalties.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const simular = () => {
    if (!obraSel) {
      alert('Registre uma obra primeiro.')
      return
    }
    simularPagamento(obraSel, licenciado.trim() || 'Licenciado Demo')
    setPagamentos(carregarPagamentos())
  }

  const limpar = () => {
    if (!confirm('Apagar todos os pagamentos?')) return
    const d = lerDados()
    d.pagamentos = []
    salvarDados(d)
    setPagamentos([])
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
          <Link to="/verificar" className="item-nav-ml">
            <span data-icone="verificar">Verificar</span>
          </Link>
          <Link to="/royalties" className="item-nav-ml ativo">
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
          <h1>Royalties</h1>
          <p>Pagamentos recebidos por licença</p>
        </header>

        <section className="conteudo-principal-royalties">
          <div className="card-recebido-mes">
            <span id="titulo-recebido">Recebidos no mês</span>
            <span id="subtitulo-recebido">● LIQUIDADO</span>
            <p className="valor-recebido">
              <span id="total-mes">{dinheiro(totalMes)}</span>
            </p>
          </div>

          <div className="pagamentos-royalties">
            <span>Pagamentos</span>
            <p id="valor-pagamento">{quantidade}</p>
          </div>

          <div className="rede-liquidacao">
            <span>Rede de liquidação</span>
            <p id="span-liquidacao">
              <span className="ponto"></span> Solana
            </p>
          </div>
        </section>        <div className="historico-pagamentos">
          <h2 className="titulo-arquivo-span">HISTÓRICO DE PAGAMENTOS</h2>
          <button
            type="button"
            id="btn-exportar"
            className="botao-exportar"
            onClick={exportarCSV}
          >
            Exportar CSV
          </button>
        </div>

        <details className="simulador">
          <summary>MODO DEMONSTRAÇÃO · SIMULAR PAGAMENTO</summary>
          <div className="simulador-corpo">
            <label className="simulador-campo">
              Obra
              <select
                id="sel-obra"
                value={obraSel}
                onChange={(e) => setObraSel(e.target.value)}
              >
                {obras.length === 0 && <option>Nenhuma obra registrada</option>}
                {obras.map((o) => (
                  <option key={o.hash} value={o.hash}>
                    {o.obra} · {dinheiro(o.preco)} USDC
                  </option>
                ))}
              </select>
            </label>

            <label className="simulador-campo">
              Licenciado
              <input
                id="inp-licenciado"
                type="text"
                placeholder="Ex.: Coletivo Prisma"
                value={licenciado}
                onChange={(e) => setLicenciado(e.target.value)}
              />
            </label>

            <button
              type="button"
              id="btn-simular"
              className="botao-exportar"
              onClick={simular}
              disabled={obras.length === 0}
            >
              Simular pagamento
            </button>

            <button
              type="button"
              id="btn-limpar"
              className="botao-exportar"
              onClick={limpar}
            >
              Limpar pagamentos
            </button>
          </div>
        </details>

        <div id="lista-pagamentos">
          {pagamentos.length === 0 && (
            <p className="lista-vazia">Nenhum pagamento recebido ainda.</p>
          )}

          {pagamentos.map((p, i) => {
            const simulado = p.assinatura.startsWith('SIMULADO')

            return (
              <section className="pagamentos" key={p.assinatura + i}>
                <div className="royalties-linha">
                  <div className="pagamento-topo">
                    <span className="pagamento-icone">↙</span>

                    <div className="pagamento-data">
                      <small>PAGO EM</small>
                      <span>{formatarData(p.data)}</span>
                    </div>

                    <div className="pagamento-obra">
                      <strong>{p.obra}</strong>
                      <small>Licença · {p.licenciado}</small>
                    </div>

                    <a
                      className="pagamento-tx"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={
                        simulado
                          ? undefined
                          : `https://explorer.solana.com/tx/${p.assinatura}?cluster=devnet`
                      }
                      title={simulado ? 'Pagamento simulado (demonstração)' : undefined}
                    >
                      <span>{hashCurto(p.assinatura)}</span> ↗
                    </a>

                    <span className="pagamento-valor">
                      <span>{dinheiro(p.valor)}</span> <small>USDC</small>
                    </span>
                  </div>

                  <div className="pagamento-divisao">
                    <span className="pagamento-divisao-titulo">DIVISÃO</span>
                    <div className="beneficiarios">
                      {p.divisao.map((b, j) => (
                        <div className="beneficiario" key={j}>
                          <span className="beneficiario-iniciais">{iniciais(b.nome)}</span>
                          <div className="beneficiario-info">
                            <strong>{b.nome}</strong>
                            <small>{b.percentual}%</small>
                          </div>
                          <span className="beneficiario-parte">
                            {dinheiro((p.valor * b.percentual) / 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}