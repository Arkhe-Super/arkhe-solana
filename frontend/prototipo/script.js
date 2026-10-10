const switchModo = document.getElementById("switch");

if (switchModo) {
    const escuroInicial = localStorage.getItem("tema") !== "claro";

    switchModo.checked = escuroInicial;

    document.body.classList.toggle("modo-escuro", escuroInicial);
    document.body.classList.toggle("modo-claro", !escuroInicial);

    switchModo.addEventListener("change", function () {
        const escuro = switchModo.checked;

        document.body.classList.toggle("modo-escuro", escuro);
        document.body.classList.toggle("modo-claro", !escuro);

        localStorage.setItem("tema", escuro ? "escuro" : "claro");
    });
}

const inputArquivo = document.getElementById("arquivo");

if (inputArquivo) {
    const areaUpload = document.querySelector(".area-upload");
    const nomeArquivo = document.getElementById("nome-arquivo");
    const infoArquivo = document.getElementById("info-arquivo");
    const cardImpressao = document.querySelector(".card-impressao");

    const valorHash = document.createElement("p");

    valorHash.className = "valor-hash";
    valorHash.textContent = "Escolha um arquivo para gerar";

    if (cardImpressao) {
        cardImpressao.appendChild(valorHash);
    }

    const formatarTamanho = (bytes) => {
        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        if (bytes < 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        }

        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    };

    const gerarHash = async (arquivo) => {
        const buffer = await arquivo.arrayBuffer();

        const resultado = await crypto.subtle.digest(
            "SHA-256",
            buffer
        );

        return Array.from(new Uint8Array(resultado))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    };

    const processarArquivo = async (arquivo) => {
        if (nomeArquivo) {
            nomeArquivo.textContent = arquivo.name;
        }

        if (infoArquivo) {
            infoArquivo.textContent =
                formatarTamanho(arquivo.size) +
                " · " +
                (arquivo.type || "tipo desconhecido");
        }

        valorHash.textContent =
            "Gerando impressão digital...";

        try {
            const hash = await gerarHash(arquivo);

            if (inputArquivo.files[0] !== arquivo) {
                return;
            }

            valorHash.textContent = hash;
        } catch (erro) {
            valorHash.textContent =
                "Não foi possível gerar a impressão digital.";
        }
    };

    inputArquivo.addEventListener("change", () => {
        const arquivo = inputArquivo.files[0];

        if (arquivo) {
            processarArquivo(arquivo);
        }
    });

    if (areaUpload) {
        areaUpload.addEventListener("dragover", (evento) => {
            evento.preventDefault();
            areaUpload.classList.add("arrastando");
        });

        areaUpload.addEventListener("dragleave", () => {
            areaUpload.classList.remove("arrastando");
        });

        areaUpload.addEventListener("drop", (evento) => {
            evento.preventDefault();

            areaUpload.classList.remove("arrastando");

            const arquivo = evento.dataTransfer.files[0];

           if (arquivo) {
                inputArquivo.files = evento.dataTransfer.files;   // ← linha nova
                processarArquivo(arquivo);
            }
        });
    }
}

const listaBeneficiarios =
    document.getElementById("lista-beneficiarios");

if (listaBeneficiarios) {
    const botaoAdicionar =
        document.getElementById("btn-adicionar");

    const modeloBeneficiario =
        document.getElementById("modelo-beneficiario");

    const resumoSoma =
        document.getElementById("benef-resumo-soma");

    const atualizarSoma = () => {
        const campos =
            listaBeneficiarios.querySelectorAll(
                ".benef-percentual input"
            );

        let soma = 0;

        campos.forEach((campo) => {
            soma += Number(campo.value) || 0;
        });

        soma = Math.round(soma * 100) / 100;

        if (!resumoSoma) {
            return;
        }

        resumoSoma.classList.remove(
            "valida",
            "invalida"
        );

        if (campos.length === 0) {
            resumoSoma.textContent = "";
            return;
        }

        if (soma === 100) {
            resumoSoma.classList.add("valida");
            resumoSoma.textContent =
                "Distribuição válida · 100%";
        } else {
            resumoSoma.classList.add("invalida");
            resumoSoma.textContent =
                "A soma precisa ser 100% (atual: " +
                soma +
                "%)";
        }
    };

    const adicionarBeneficiario = () => {
        if (!modeloBeneficiario) {
            return;
        }

        listaBeneficiarios.appendChild(
            modeloBeneficiario.content.cloneNode(true)
        );

        atualizarSoma();
    };

    if (botaoAdicionar) {
        botaoAdicionar.addEventListener(
            "click",
            adicionarBeneficiario
        );
    }

    listaBeneficiarios.addEventListener(
        "input",
        atualizarSoma
    );

    listaBeneficiarios.addEventListener(
        "click",
        (evento) => {
            const botaoRemover =
                evento.target.closest(".btn-remover");

            if (botaoRemover) {
                const linha =
                    botaoRemover.closest(".benef-linha");

                if (linha) {
                    linha.remove();
                    atualizarSoma();
                }
            }
        }
    );

    adicionarBeneficiario();
}

const cardVerificarOriginal =
    document.querySelector(".card-verificar");

if (cardVerificarOriginal) {
    const conteudo =
        document.querySelector(".conteudo-principal");

    const cabecalho =
        document.querySelector(".hader-menu-principal");

    const criar = (tag, classe, texto) => {
        const elemento =
            document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    };

    const formatarTamanho = (bytes) => {
        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        if (bytes < 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        }

        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    };

    const gerarHash = async (arquivo) => {
        const buffer =
            await arquivo.arrayBuffer();

        const resultado =
            await crypto.subtle.digest(
                "SHA-256",
                buffer
            );

        return Array.from(new Uint8Array(resultado))
            .map((byte) =>
                byte.toString(16).padStart(2, "0")
            )
            .join("");
    };

    const buscarRegistro = async (hash) => {
        return buscarObraPorHash(hash);
    };

    if (cabecalho) {
        const titulo =
            cabecalho.querySelector("h1");

        if (titulo) {
            titulo.textContent = "Verificação";
        }
    }

    const grade =
        criar("div", "grade-verificar");

    const colunaEsquerda =
        criar("div", "verif-coluna");

    const colunaDireita =
        criar("div", "verif-coluna");

    const inputArquivoVerificar =
        document.createElement("input");

    inputArquivoVerificar.type = "file";
    inputArquivoVerificar.id =
        "arquivo-verificar";
    inputArquivoVerificar.style.display =
        "none";

    const areaUpload =
        document.createElement("div");

    areaUpload.className =
        "area-upload";

    areaUpload.setAttribute(
        "role",
        "button"
    );

    areaUpload.setAttribute(
        "tabindex",
        "0"
    );

    const nome =
        criar(
            "strong",
            "",
            "Clique para escolher um arquivo"
        );

    const info =
        criar(
            "span",
            "",
            "ou arraste e solte aqui"
        );

    areaUpload.append(
        criar(
            "div",
            "icone-arquivo",
            "📄"
        ),
        nome,
        info
    );

    const botao =
        criar(
            "button",
            "botao-principal",
            "Verificar autenticidade"
        );

    botao.type = "button";
    botao.disabled = true;

    const cardInfo =
        criar("div", "card-info");

    const notaPrivacidade =
        criar(
            "p",
            "nota-privacidade",
            "O arquivo não sai do seu computador. Só a impressão digital é usada."
        );

    cardInfo.appendChild(
        notaPrivacidade
    );

    const cardComparacao =
        criar(
            "div",
            "card-info"
        );

    const tituloComparacao =
        criar(
            "h3",
            "",
            "Comparação precisa"
        );

    const textoComparacao =
        criar(
            "p",
            "",
            "Compare a impressão digital do arquivo com um registro existente."
        );

    cardComparacao.append(
        tituloComparacao,
        textoComparacao
    );

    colunaEsquerda.append(
        criar(
            "span",
            "titulo-arquivo-span",
            "ENVIAR ARQUIVO"
        ),
        inputArquivoVerificar,
        areaUpload,
        botao,
        cardInfo,
        cardComparacao
    );

    const areaResultado =
        criar(
            "div",
            "area-resultado"
        );

    colunaDireita.append(
        criar(
            "span",
            "titulo-arquivo-span",
            "RESULTADO DA VERIFICAÇÃO"
        ),
        areaResultado
    );

    if (conteudo) {
        grade.append(
            colunaEsquerda,
            colunaDireita
        );

        cardVerificarOriginal.replaceWith(
            grade
        );
    }

    const mostrarVazio = (texto) => {
        const resultado =
            criar(
                "div",
                "resultado-vazio"
            );

        resultado.append(
            criar(
                "div",
                "icone-resultado",
                "⌕"
            ),
            criar(
                "p",
                "",
                texto
            )
        );

        areaResultado.replaceChildren(
            resultado
        );
    };

    const mostrarEncontrado = (registro) => {
        const card =
            criar(
                "div",
                "card-resultado"
            );

        const topo =
            criar(
                "div",
                "resultado-topo"
            );

        const titulos =
            criar(
                "div",
                "resultado-titulos"
            );

        titulos.append(
            criar(
                "span",
                "rotulo-resultado",
                "CORRESPONDÊNCIA EXATA"
            ),
            criar(
                "h2",
                "titulo-resultado",
                "Original registrado"
            )
        );

        const selo =
            criar(
                "span",
                "selo-resultado",
                "✓ AUTÊNTICO"
            );

        topo.append(
            titulos,
            selo
        );

        const dados =
            criar(
                "div",
                "dados-resultado"
            );

        const informacoes = [
            ["Obra", registro.obra],
            ["Autor", registro.autor],
            ["Data do registro", registro.data],
            ["Hash", registro.hash],
            ["Blockchain", "Solana"]
        ];

        informacoes.forEach(
            ([rotulo, valor]) => {
                const dado =
                    criar(
                        "div",
                        "dado"
                    );

                dado.append(
                    criar(
                        "span",
                        "dado-rotulo",
                        rotulo
                    ),
                    criar(
                        "span",
                        "dado-valor",
                        valor
                    )
                );

                dados.appendChild(
                    dado
                );
            }
        );

        card.append(
            topo,
            dados
        );

        areaResultado.replaceChildren(
            card
        );
    };

    const mostrarNaoEncontrado = () => {
        const card =
            criar(
                "div",
                "card-resultado"
            );

        const topo =
            criar(
                "div",
                "resultado-topo"
            );

        const titulos =
            criar(
                "div",
                "resultado-titulos"
            );
        titulos.append(
            criar(
                "span",
                "rotulo-resultado",
                "VERIFICAÇÃO"
            ),
            criar(
                "h2",
                "titulo-resultado",
                "Registro não encontrado"
            )
        );

        const selo =
            criar(
                "a",
                "selo-resultado",
                "✕ NÃO ENCONTRADO"
            );
            selo.href = "registrar.html";

        topo.append(
            titulos,
            selo
        );

        const mensagem =
            criar(
                "p",
                "nota-privacidade",
                "Nenhum registro corresponde à impressão digital deste arquivo."
            );

        card.append(
            topo,
            mensagem
        );

        areaResultado.replaceChildren(
            card
        );
    };

    const processarArquivoVerificacao =
        async (arquivo) => {

        nome.textContent =
            arquivo.name;

        info.textContent =
            formatarTamanho(
                arquivo.size
            ) +
            " · " +
            (
                arquivo.type ||
                "tipo desconhecido"
            );

        botao.disabled = true;

        mostrarVazio(
            "Gerando impressão digital..."
        );

        try {
            const hash =
                await gerarHash(
                    arquivo
                );

            if (
                inputArquivoVerificar.files[0] !== arquivo
            ) {
                return;
            }

            botao.dataset.hash =
                hash;

            botao.disabled = false;

            mostrarVazio(
                "Arquivo pronto para verificação."
            );
        } catch (erro) {
            botao.disabled = true;

            mostrarVazio(
                "Não foi possível gerar a impressão digital."
            );
        }
    };

    inputArquivoVerificar.addEventListener(
        "change",
        () => {
            const arquivo =
                inputArquivoVerificar.files[0];

            if (arquivo) {
                processarArquivoVerificacao(
                    arquivo
                );
            }
        }
    );

    areaUpload.addEventListener(
        "click",
        () => {
            inputArquivoVerificar.click();
        }
    );

    areaUpload.addEventListener(
        "keydown",
        (evento) => {
            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {
                evento.preventDefault();
                inputArquivoVerificar.click();
            }
        }
    );

    areaUpload.addEventListener(
        "dragover",
        (evento) => {
            evento.preventDefault();

            areaUpload.classList.add(
                "arrastando"
            );
        }
    );

    areaUpload.addEventListener(
        "dragleave",
        () => {
            areaUpload.classList.remove(
                "arrastando"
            );
        }
    );

    areaUpload.addEventListener(
        "drop",
        (evento) => {
            evento.preventDefault();

            areaUpload.classList.remove(
                "arrastando"
            );

            const arquivo =
                evento.dataTransfer.files[0];

            if (arquivo) {
                inputArquivoVerificar.files =
                    evento.dataTransfer.files;                    // ← linhas novas

                processarArquivoVerificacao(
                    arquivo
                );
            }
        }
    );

    botao.addEventListener(
        "click",
        async () => {
            const arquivo =
                inputArquivoVerificar.files[0];

            if (!arquivo) {
                return;
            }

            botao.disabled = true;

            botao.textContent =
                "Verificando...";

            mostrarVazio(
                "Verificando autenticidade..."
            );

            try {
                const hash =
                    await gerarHash(
                        arquivo
                    );

                const registro =
                    await buscarRegistro(
                        hash
                    );

                if (registro) {
                    mostrarEncontrado(
                        registro
                    );
                } else {
                    mostrarNaoEncontrado();
                }
            } catch (erro) {
                mostrarVazio(
                    "Não foi possível verificar o arquivo."
                );
            } finally {
                botao.disabled = false;

                botao.textContent =
                    "Verificar autenticidade";
            }
        }
    );

    mostrarVazio(
        "Selecione um arquivo para iniciar a verificação."
    );
}

const btnRegistrar =
    document.getElementById("btn-registrar");

if (btnRegistrar) {
    btnRegistrar.addEventListener(
        "click",
        async () => {
            const inputArquivoRegistro =
                document.getElementById("arquivo");

            const arquivo =
                inputArquivoRegistro.files[0];

            const titulo =
                document.getElementById("titulo")
                    .value
                    .trim();

            const autor =
                document.getElementById("autor")
                    .value
                    .trim();

            const preco =
                document.getElementById("preco")
                    .value;

            if (!arquivo) {
                alert("Selecione o arquivo da obra.");
                return;
            }

            if (!titulo) {
                alert("Informe o título da obra.");
                return;
            }

            if (!autor) {
                alert("Informe o autor da obra.");
                return;
            }

            if (!preco) {
                alert("Informe o preço da licença.");
                return;
            }

            btnRegistrar.disabled = true;
            btnRegistrar.textContent =
                "Preparando registro...";

            try {
                const buffer =
                    await arquivo.arrayBuffer();

                const resultado =
                    await crypto.subtle.digest(
                        "SHA-256",
                        buffer
                    );
                const hash = Array.from(new Uint8Array(resultado))
                    .map((byte) => byte.toString(16).padStart(2, "0"))
                    .join("");

                const divisao = Array.from(
                document.querySelectorAll("#lista-beneficiarios .benef-linha")
            ).map((linha) => ({
                nome: linha.querySelector("input[type='text']")?.value.trim() || "Sem nome",
                percentual: Number(linha.querySelector(".benef-percentual input").value) || 0,
            }));

            const soma = divisao.reduce((s, b) => s + b.percentual, 0);

            if (Math.round(soma * 100) / 100 !== 100) {
                alert("A soma da divisão precisa ser 100%.");
                return;
            }

            if (buscarObraPorHash(hash)) {
                alert("Este arquivo já foi registrado.");
                return;
            }

            adicionarObra({
                obra: titulo,
                autor,
                preco: Number(preco),
                hash,
                arquivo: arquivo.name,
                data: new Date().toISOString().slice(0, 10),
                divisao,
            });

            alert("Obra registrada!");
            } catch (erro) {
                console.error(erro);

                alert(
                    "Não foi possível preparar o registro."
                );
            } finally {
                btnRegistrar.disabled = false;
                btnRegistrar.textContent =
                    "Registrar obra";
            }
        }
    );
}
