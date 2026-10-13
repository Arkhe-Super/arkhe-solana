const CHAVE = 'arkhe:dados'

export type Beneficiario = {
  nome: string
  percentual: number
}

export type Obra = {
  obra: string
  autor: string
  preco: number
  hash: string
  arquivo: string
  data: string
  divisao: Beneficiario[]
}

export type Pagamento = {
  data: string
  obra: string
  licenciado: string
  assinatura: string
  valor: number
  divisao: Beneficiario[]
}

type Dados = {
  obras: Obra[]
  pagamentos: Pagamento[]
}

export function lerDados(): Dados {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE) || 'null')
    return { obras: d?.obras || [], pagamentos: d?.pagamentos || [] }
  } catch {
    return { obras: [], pagamentos: [] }
  }
}

export function salvarDados(dados: Dados) {
  localStorage.setItem(CHAVE, JSON.stringify(dados))
}

export function adicionarObra(obra: Obra) {
  const dados = lerDados()
  dados.obras.push(obra)
  salvarDados(dados)
}

export function adicionarPagamento(pagamento: Pagamento) {
  const dados = lerDados()
  dados.pagamentos.push(pagamento)
  salvarDados(dados)
}

export function buscarObraPorHash(hash: string) {
  return lerDados().obras.find((o) => o.hash === hash) || null
}

export function simularPagamento(
  hashDaObra: string,
  licenciado: string,
  valor?: number
) {
  const obra = buscarObraPorHash(hashDaObra)
  if (!obra) return
  adicionarPagamento({
    data: new Date().toISOString().slice(0, 10),
    obra: obra.obra,
    licenciado,
    assinatura: 'SIMULADO' + Math.random().toString(36).slice(2, 12),
    valor: valor ?? obra.preco,
    divisao: obra.divisao,
  })
}