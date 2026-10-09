const CHAVE = 'arkhe:dados';

function lerDados() {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE));
    return { obras: d?.obras || [], pagamentos: d?.pagamentos || [] };
  } catch {
    return { obras: [], pagamentos: [] };
  }
}

function salvarDados(dados) {
  localStorage.setItem(CHAVE, JSON.stringify(dados));
}

function adicionarObra(obra) {
  const dados = lerDados();
  dados.obras.push(obra);
  salvarDados(dados);
}

function adicionarPagamento(pagamento) {
  const dados = lerDados();
  dados.pagamentos.push(pagamento);
  salvarDados(dados);
}

function buscarObraPorHash(hash) {
  return lerDados().obras.find((o) => o.hash === hash) || null;
}

function simularPagamento(hashDaObra, licenciado, valor) {
  const obra = buscarObraPorHash(hashDaObra);
  if (!obra) return;
  adicionarPagamento({
    data: new Date().toISOString().slice(0, 10),
    obra: obra.obra,
    licenciado,
    assinatura: 'SIMULADO' + Math.random().toString(36).slice(2, 12),
    valor: valor ?? obra.preco,
    divisao: obra.divisao,
  });
  
}