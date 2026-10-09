const pagamentos = lerDados().pagamentos;

pagamentos.sort((a,b) => b.data.localeCompare(a.data));

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const dinheiro = (n) => n.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});

function formatarData(iso) {
    const [ano, mes, dia] = iso.split('-');
    return `${dia} ${MESES[Number(mes) -1]} ${ano}`;
}

const iniciais = (nome) =>    nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const hashCurto = (h) => `${h.slice(0, 4)}...${h.slice(-4)}`;

function desenharResumo() {
    if (pagamentos.length === 0) {
        document.getElementById('total-mes').textContent = '0,00';
        document.getElementById('valor-pagamento').textContent = '00';
        return;
    }

    const mesAtual = pagamentos[0].data.slice(0, 7);
    const doMes = pagamentos.filter((p) => p.data.startsWith(mesAtual));
    const totalMes = doMes.reduce((soma, p) => soma + p.valor, 0);

    document.getElementById('total-mes').textContent = dinheiro(totalMes);
    document.getElementById('valor-pagamento').textContent = String(pagamentos.length).padStart(2, '0');
}

function desenharPagamentos() {
  const lista = document.getElementById('lista-pagamentos');
  const modeloPagamento = document.getElementById('modelo-royalties');
  const modeloBenef = document.getElementById('modelo-beneficiario-pagto');
  lista.replaceChildren();

  if (pagamentos.length === 0) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Nenhum pagamento recebido ainda.';
    lista.appendChild(vazio);
    return;
    }
pagamentos.forEach((p) => {
const card = modeloPagamento.content.cloneNode(true);

card.querySelector('.js-data').textContent = formatarData(p.data);
card.querySelector('.js-obra').textContent = p.obra;
card.querySelector('.js-licenca').textContent = `Licença · ${p.licenciado}`;
card.querySelector('.js-hash').textContent = hashCurto(p.assinatura);
card.querySelector('.js-tx').href = `https://explorer.solana.com/tx/${p.assinatura}?cluster=devnet`;
card.querySelector('.js-valor').textContent = dinheiro(p.valor);

const areaBenef = card.querySelector('.js-beneficiarios');
p.divisao.forEach((b) => {
    const benef = modeloBenef.content.cloneNode(true);
    benef.querySelector('.js-iniciais').textContent = iniciais(b.nome);
    benef.querySelector('.js-nome').textContent = b.nome;
    benef.querySelector('.js-pct').textContent = `${b.percentual}%`;
    benef.querySelector('.js-parte').textContent = dinheiro((p.valor * b.percentual) / 100);
    areaBenef.appendChild(benef);
});

lista.appendChild(card);
});
}

const celula = (valor) => `"${String(valor).replaceAll('"', '""')}"`;
const numeroBR = (n) => n.toFixed(2).replace('.', ',');

function exportarCSV() {
  const linhas = [['Data', 'Obra', 'Licenciado', 'Valor (USDC)', 'Beneficiário', 'Percentual', 'Parte (USDC)', 'Transação']];

  pagamentos.forEach((p) => {
    p.divisao.forEach((b) => {
      linhas.push([p.data, p.obra, p.licenciado, numeroBR(p.valor), b.nome,
                   `${b.percentual}%`, numeroBR((p.valor * b.percentual) / 100), p.assinatura]);
    });
  });

  const csv = '\ufeff' + linhas.map((l) => l.map(celula).join(';')).join('\n');

  const arquivo = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'royalties.csv';
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById('btn-exportar').addEventListener('click', exportarCSV);

const selObra = document.getElementById('sel-obra');
const inpLicenciado = document.getElementById('inp-licenciado');
const btnSimular = document.getElementById('btn-simular');
const btnLimpar = document.getElementById('btn-limpar');

if (selObra && btnSimular) {
    const obrasRegistradas = lerDados().obras;

    if (obrasRegistradas.length === 0) {
        const op = document.createElement('option');
        op.textContent = 'Nenhuma obra registrada';
        selObra.appendChild(op);
        btnSimular.disabled = true;
    } else {
        obrasRegistradas.forEach((o) => {
            const op = document.createElement('option');
            op.value = o.hash;
            op.textContent = `${o.obra} · ${dinheiro(o.preco)} USDC`;
            selObra.appendChild(op);
        });
    }

    btnSimular.addEventListener('click', () => {
        if (!selObra.value) {
            alert('Registre uma obra primeiro.');
            return;
        }
        simularPagamento(selObra.value, inpLicenciado.value.trim() || 'Licenciado Demo');
        location.reload();
    });
}

if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
        if (!confirm('Apagar todos os pagamentos?')) return;
        const d = lerDados();
        d.pagamentos = [];
        salvarDados(d);
        location.reload();
    });
}

try {
    desenharResumo();
    desenharPagamentos();
} catch (erro) {
    console.error('Erro ao desenhar pagamentos:', erro);
}