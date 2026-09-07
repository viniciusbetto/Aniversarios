/* =========================================================
APP ANIVERSARIANTES
Banco de dados: IndexedDB
========================================================= */

// =========================================================
// CONFIGURAÇÃO DO BANCO
// =========================================================

console.log("VERSÃO NOVA - 07/09/2026");

const DB_NAME = "AniversariantesDB";
const DB_VERSION = 1;
const STORE_NAME = "aniversariantes";

let banco = null;

// =========================================================
// MESES
// =========================================================

const MESES = [
"",
"JANEIRO",
"FEVEREIRO",
"MARÇO",
"ABRIL",
"MAIO",
"JUNHO",
"JULHO",
"AGOSTO",
"SETEMBRO",
"OUTUBRO",
"NOVEMBRO",
"DEZEMBRO"
];

// =========================================================
// VARIÁVEIS GLOBAIS
// =========================================================

let aniversariantes = [];
let aniversarianteEditandoId = null;

let ordenacao = {
campo: "nome",
direcao: "asc"
};

// =========================================================
// ELEMENTOS HTML
// =========================================================

const telaPrincipal = document.getElementById("telaPrincipal");
const telaTodos = document.getElementById("telaTodos");
const telaFormulario = document.getElementById("telaFormulario");
const selectMesPrincipal = document.getElementById("selectMesPrincipal");
const listaAniversariantes = document.getElementById("listaAniversariantes");
const listaTodos = document.getElementById("listaTodos");
const inputBusca = document.getElementById("inputBusca");
const inputNome = document.getElementById("inputNome");
const inputDia = document.getElementById("inputDia");
const selectMes = document.getElementById("selectMes");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnTodos = document.getElementById("btnTodos");
const btnNovo = document.getElementById("btnNovo");
const btnVoltarPrincipal = document.getElementById("btnVoltarPrincipal");
const btnVoltarLista = document.getElementById("btnVoltarLista");
const btnGravar = document.getElementById("btnGravar");
const btnExcluir = document.getElementById("btnExcluir");
const ordenarNome = document.getElementById("ordenarNome");
const ordenarDia = document.getElementById("ordenarDia");
const ordenarMes = document.getElementById("ordenarMes");
const btnImportar = document.getElementById("btnImportar");
const btnExportar = document.getElementById("btnExportar");


// =========================================================
// INICIALIZAÇÃO
// =========================================================

document.addEventListener(
"DOMContentLoaded",
iniciarApp
);

// =========================================================
// CONVERSÃO AUTOMÁTICA PARA MAIÚSCULO
// =========================================================

document.addEventListener("input",function (event) {
    const elemento = event.target;
    if (
        elemento.tagName === "INPUT" ||
        elemento.tagName === "TEXTAREA"
    ) {
        if (elemento.hasAttribute("data-maiusculo")) 
            {elemento.value = elemento.value.toUpperCase(); }
    }
}

);

// =========================================================
// INICIAR APLICAÇÃO
// =========================================================

async function iniciarApp() {
    try {
        await abrirBanco();
        /*
        * Ccarrega os dados do IndexedDB
        * para a variável em memória.
        */
        await carregarDados();
        // Mês atual
        const hoje = new Date();
        const mesAtual = hoje.getMonth() + 1;
        selectMesPrincipal.value = mesAtual;
        configurarEventos();
        mostrarTelaPrincipal();
    } catch (erro) {
        console.error("Erro ao iniciar o aplicativo:", erro);
        alert("Não foi possível iniciar o banco de dados.");
    }
}

// =========================================================
// ABRIR INDEXEDDB
// =========================================================

function abrirBanco() {
    return new Promise(
        function (resolve, reject) {
            const requisicao = indexedDB.open(
                DB_NAME,
                DB_VERSION
            );
            // Criação / atualização do banco
            requisicao.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(
                        STORE_NAME
                    )
                ) {db.createObjectStore(
                        STORE_NAME,
                        {
                            keyPath: "id"
                        }
                    );
                }
            };
            requisicao.onsuccess = function (event) {
                banco = event.target.result;
                banco.onerror = function (event) {
                    console.error("Erro no IndexedDB:", event.target.error);
                };
                resolve(banco);
            };
            requisicao.onerror = function (event) {
                reject(event.target.error);
            };
        }
    );
}

// =========================================================
// CARREGAR TODOS OS DADOS DO INDEXEDDB
// =========================================================

function carregarDados() {
    return new Promise(
        function (resolve, reject) {
            const transacao = banco.transaction(
                STORE_NAME,
                "readonly"
            );
            const store = transacao.objectStore(
                STORE_NAME
            );
            const requisicao = store.getAll();
            requisicao.onsuccess = function () {
                aniversariantes = requisicao.result || [];
                resolve(aniversariantes);
            };
            requisicao.onerror =
                function () {
                    reject(requisicao.error);
                };

        }
    );
}

// =========================================================
// ADICIONAR REGISTRO AO INDEXEDDB
// =========================================================

function adicionarNoBanco(registro) {
    return new Promise(
        function (resolve, reject) {
            const transacao = banco.transaction(
                STORE_NAME,
                "readwrite"
            );
            const store = transacao.objectStore(
                STORE_NAME
            );
            const requisicao = store.add(registro);
            requisicao.onsuccess = function () {
                resolve();
            };
            requisicao.onerror = function () {
                reject(requisicao.error);
            };
        }
    );
}

// =========================================================
// ALTERAR REGISTRO NO INDEXEDDB
// =========================================================

function atualizarNoBanco(registro) {
    return new Promise(
        function (resolve, reject) {
            const transacao = banco.transaction(
                STORE_NAME,
                "readwrite"
            );
            const store = transacao.objectStore(
                STORE_NAME
            );
            const requisicao = store.put(registro);
            requisicao.onsuccess = function () {
                resolve();
            };
            requisicao.onerror = function () {
                reject(requisicao.error);
            };
        }
    );
}

// =========================================================
// EXCLUIR REGISTRO DO INDEXEDDB
// =========================================================

function excluirDoBanco(id) {
    return new Promise(
        function (resolve, reject) {
            const transacao = banco.transaction(
                STORE_NAME,
                "readwrite"
            );
            const store = transacao.objectStore(
                STORE_NAME
            );
            const requisicao = store.delete(id);
            requisicao.onsuccess = function () {
                resolve();
            };
            requisicao.onerror = function () {
                reject(requisicao.error);
            };
        }
    );


}

// =========================================================
// CONFIGURAÇÃO DOS EVENTOS
// =========================================================

function configurarEventos() {

    // Mudança do mês
    selectMesPrincipal.addEventListener("change", function () {
        listarAniversariantesDoMes();}
    );

    // VER TODOS
    btnTodos.addEventListener("click", function () {
        inputBusca.value = "";
        mostrarTelaTodos();}
    );

    // NOVO
    btnNovo.addEventListener("click", function () {
        novoAniversariante();}
    );

    // VOLTAR PRINCIPAL
    btnVoltarPrincipal.addEventListener("click", function () {
        mostrarTelaPrincipal();}
    );

    // VOLTAR LISTA
    btnVoltarLista.addEventListener("click", function () {
        mostrarTelaTodos();}
    );

    // GRAVAR
    btnGravar.addEventListener("click", function () {
        gravarAniversariante();}
    );

    // EXCLUIR
    btnExcluir.addEventListener("click", function () {
        excluirAniversariante();}
    );

    // BUSCA
    inputBusca.addEventListener("input", function () {
        listarTodos();}
    );

    // ORDENAÇÃO
    ordenarNome.addEventListener("click", function () {
        alterarOrdenacao("nome");}
    );

    ordenarDia.addEventListener("click", function () {
        alterarOrdenacao("dia");}
    );

    ordenarMes.addEventListener("click", function () {
        alterarOrdenacao("mes");}
    );

    // ENTER no campo do mês
    selectMes.addEventListener( "keydown", function (event) {
        if (event.key === "Enter") {
            gravarAniversariante();
        } }
    );

    // CONFIGURAR BOTÕES DE IMPORTAR E EXPORTAR
    btnImportar.addEventListener("click", function () {
        importarAniversariantes();
    });
    btnExportar.addEventListener("click", function () {
        exportarAniversariantes();
    });

}

// =========================================================
// CONTROLE DE TELAS
// =========================================================

function ocultarTodasAsTelas() {
    telaPrincipal.classList.add("oculto");
    telaTodos.classList.add("oculto");
    telaFormulario.classList.add("oculto");
}

function mostrarTelaPrincipal() {
    ocultarTodasAsTelas();
    telaPrincipal.classList.remove("oculto");
    listarAniversariantesDoMes();
}

function mostrarTelaTodos() {
    ocultarTodasAsTelas();
    telaTodos.classList.remove("oculto");
    listarTodos();
}

function mostrarTelaFormulario() {
    ocultarTodasAsTelas();
    telaFormulario.classList.remove("oculto");
}

// =========================================================
// LISTA DA TELA PRINCIPAL
// =========================================================

function listarAniversariantesDoMes() {
    const mesSelecionado = Number(selectMesPrincipal.value);
    const listaMes = aniversariantes.filter(
        function (aniversariante) {
            return Number(aniversariante.mes) === mesSelecionado;
        }
    ).sort( function (a, b) {
        return Number(a.dia) - Number(b.dia);}
    );

    listaAniversariantes.innerHTML = "";

    if (listaMes.length === 0) {
        listaAniversariantes.innerHTML = `
            <div class="lista-vazia">
                Nenhum aniversariante cadastrado em
                ${MESES[mesSelecionado]}.
            </div>
        `;
        return;
    }

    listaMes.forEach(
        function (aniversariante) {
            const item = document.createElement("div");
            item.className = "item-aniversariante";
            item.innerHTML = `
                <div class="item-dia">
                    ${String(
                        aniversariante.dia
                    ).padStart(2, "0")}
                </div>
                <div class="item-nome">
                    ${escaparHtml(
                        aniversariante.nome
                    )}
                </div>
            `;
            listaAniversariantes.appendChild(item);
        }
    );
}

// =========================================================
// LISTA DE TODOS
// =========================================================

function listarTodos() {
    const textoBusca = inputBusca.value.trim().toLowerCase();
    let listaFiltrada = aniversariantes.filter(
            function (aniversariante) {
                return aniversariante.nome
                    .toLowerCase()
                    .includes(textoBusca);
            }
        );
    listaFiltrada = ordenarLista(listaFiltrada);
    listaTodos.innerHTML = "";
    if (listaFiltrada.length === 0) {
        listaTodos.innerHTML = `
            <tr>
                <td colspan="3"
                    class="text-center">
                    Nenhum aniversariante encontrado.
                </td>
            </tr>
        `;
        atualizarCabecalhosOrdenacao();
        return;
    }


    listaFiltrada.forEach(
        function (aniversariante) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    ${escaparHtml(
                        aniversariante.nome
                    )}
                </td>

                <td class="text-center">
                    ${String(
                        aniversariante.dia
                    ).padStart(2, "0")}
                </td>

                <td class="text-center">
                    ${MESES[
                        aniversariante.mes
                    ]}
                </td>
            `;
            tr.addEventListener(
                "click",
                function () {
                    editarAniversariante(
                        aniversariante.id
                    );
                }
            );
            listaTodos.appendChild(tr);
        }
    );
    atualizarCabecalhosOrdenacao();
}

// =========================================================
// ORDENAÇÃO
// =========================================================

function alterarOrdenacao(campo) {
    if (ordenacao.campo === campo) {
        ordenacao.direcao = ordenacao.direcao === "asc"
                ? "desc"
                : "asc";
    } else {
        ordenacao.campo = campo;
        ordenacao.direcao = "asc";
    }
    listarTodos();
}

function ordenarLista(lista) {
    return [...lista].sort(
        function (a, b) {
            let resultado = 0;
            if (ordenacao.campo === "nome") {
                resultado = a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );
            }
            if (ordenacao.campo === "dia") {
                resultado = Number(a.dia) - Number(b.dia);
            }
            if (ordenacao.campo === "mes") {
                resultado = Number(a.mes) - Number(b.mes);
                if (resultado === 0) {
                    resultado = Number(a.dia) - Number(b.dia);
                }
            }
            return ordenacao.direcao === "asc"
                ? resultado
                : resultado * -1;
        }
    );
}

function atualizarCabecalhosOrdenacao() {
    ordenarNome.textContent = "NOME " + obterSetaOrdenacao("nome");
    ordenarDia.textContent =  "DIA " + obterSetaOrdenacao("dia");
    ordenarMes.textContent =  "MÊS " + obterSetaOrdenacao("mes");
}

function obterSetaOrdenacao(campo) {
    if (ordenacao.campo !== campo) {
        return "↕";
    }
    return ordenacao.direcao === "asc"
        ? "↑"
        : "↓";
}

// =========================================================
// NOVO ANIVERSARIANTE
// =========================================================

function novoAniversariante() {
    aniversarianteEditandoId = null;
    tituloFormulario.textContent = "Novo Aniversariante";
    inputNome.value = "";
    inputDia.value = "";
    selectMes.value = "";
    btnExcluir.style.display = "none";
    mostrarTelaFormulario();
    setTimeout(
        function () {
            inputNome.focus();
        }, 100
    );
}

// =========================================================
// EDITAR ANIVERSARIANTE
// =========================================================

function editarAniversariante(id) {
    const aniversariante = aniversariantes.find(
        function (item) {
            return item.id === id;
        }
    );
    if (!aniversariante) {
        alert( "Aniversariante não encontrado.");
        return;
    }
    aniversarianteEditandoId = aniversariante.id;
    tituloFormulario.textContent = "Editar Aniversariante";
    inputNome.value = aniversariante.nome;
    inputDia.value = aniversariante.dia;
    selectMes.value = aniversariante.mes;
    btnExcluir.style.display = "inline-block";
    mostrarTelaFormulario();
}

// =========================================================
// GRAVAR
// =========================================================

async function gravarAniversariante() {
    const nome = inputNome.value.trim();
    const dia =  Number(inputDia.value);
    const mes =  Number(selectMes.value);
    // Nome
    if (nome === "") {
        alert("Informe o nome do aniversariante.");
        inputNome.focus();
        return;
    }
    // Mês
    if (!mes || mes < 1 || mes > 12) {
        alert("Selecione o mês.");
        selectMes.focus();
        return;
    }

    // Dia
    if (!dia ||dia < 1) {
        alert("Informe um dia válido.");
        inputDia.focus();
        return;
    }
    // Validade do dia
    const ultimoDiaDoMes = obterUltimoDiaDoMes(mes);
    if (dia > ultimoDiaDoMes) {
        alert(
            `${MESES[mes]} possui apenas ` +
            `${ultimoDiaDoMes} dias.`
        );
        inputDia.focus();
        return;
    }
    try {

        // ========================================
        // NOVO
        // ========================================

        if (aniversarianteEditandoId === null) {
            const novo = {
                id: gerarId(),
                nome: nome,
                dia: dia,
                mes: mes
            };
            await adicionarNoBanco(novo);
        }


        // ========================================
        // ALTERAÇÃO
        // ========================================

        else {
            const registroAtualizado = {
                id: aniversarianteEditandoId,
                nome: nome,
                dia: dia,
                mes: mes
            };
            await atualizarNoBanco(registroAtualizado);
        }

        // Atualiza memória
        await carregarDados();
        alert("Aniversariante gravado com sucesso!");
        aniversarianteEditandoId = null;
        mostrarTelaTodos();
    } catch (erro) {
        console.error("Erro ao gravar:", erro);
        alert("Não foi possível gravar o aniversariante.");
    }
}

// =========================================================
// EXCLUIR
// =========================================================

async function excluirAniversariante() {
    if (aniversarianteEditandoId === null) {
        return;
    }
    const aniversariante = aniversariantes.find(
        function (item) {
            return item.id === aniversarianteEditandoId;
        }
    );

    if (!aniversariante) {
        return;
    }
    const confirmou =
        confirm(`Deseja realmente excluir ` + `"${aniversariante.nome}"?`
    );
    if (!confirmou) {
        return;
    }
    try {
        await excluirDoBanco(aniversarianteEditandoId);
        await carregarDados();
        aniversarianteEditandoId = null;
        alert("Aniversariante excluído com sucesso!");
        mostrarTelaTodos();
    } catch (erro) {
        console.error("Erro ao excluir:", erro);
        alert("Não foi possível excluir o aniversariante.");
    }
}

// =========================================================
// FUNÇÕES AUXILIARES
// =========================================================

function gerarId() {
    return (
        Date.now().toString() +
        Math.random()
            .toString(16)
            .slice(2)
    );
}

function obterUltimoDiaDoMes(mes) {
// Fevereiro
    if (mes === 2) {
        return 29;
    }

    // Abril, Junho, Setembro e Novembro
    if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
        return 30;
    }
    return 31;
}

function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

// =========================================================
// EXPORTAR ANIVERSARIANTES
// =========================================================
async function exportarAniversariantes() {
    try {
        const aniversariantes = await obterTabela("aniversariantes");
        const backup = {
            aplicativo: "Aniversariantes",
            versao: 1,
            exportadoEm: new Date().toISOString(),
            banco: "AniversariantesDB",
            dados: {
                aniversariantes: aniversariantes
            }
        };
        // Converte o backup para JSON
        const json = JSON.stringify(backup, null, 4);
        // Cria o arquivo para download
        const blob = new Blob(
            [json],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Aniversariantes_Backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        alert("Erro ao exportar backup.");
    }
}


// =========================================================
// LÊ QUALQUER OBJECTSTORE
// =========================================================
function obterTabela(nome) {
    return new Promise(function(resolve, reject) {
        const tx = banco.transaction([nome], "readonly");
        const store = tx.objectStore(nome);
        const req = store.getAll();
        req.onsuccess = function() {
            resolve(req.result);
        };
        req.onerror = function() {
            reject(req.error);
        };
    });
}


// =========================================================
// IMPORTAÇÃO JSON
// Arquivo localizado na pasta "dados"
// =========================================================
async function importarAniversariantes() {
    try {
        // Caminho relativo ao index.html
        const response = await fetch(
            "dados/Aniversariantes_Backup.json"
        );
        if (!response.ok) {
            throw new Error(
                "Não foi possível localizar o arquivo de backup."
            );
        }
        const backup = await response.json();
        // Verifica se o JSON possui a estrutura esperada
        if (!backup.dados) {
            throw new Error(
                "Formato inválido: não encontrei 'dados' no JSON."
            );
        }
        const aniversariantes =
            backup.dados.aniversariantes || [];
        // Grava os registros no IndexedDB
        await salvarTabela(
            "aniversariantes",
            aniversariantes
        );
        console.log("Aniversariantes importados!");
        alert(
            `${aniversariantes.length} aniversariante(s) importado(s) com sucesso!`
        );
    } catch (err) {
        console.error(err);
        alert(
            "Erro ao importar backup.\n\n" +
            err.message
        );
    }
}
// =========================================================
// SALVA DADOS EM UMA OBJECTSTORE
// =========================================================
function salvarTabela(nome, registros) {
    return new Promise((resolve, reject) => {
        if (!registros || registros.length === 0) {
            resolve();
            return;
        }
        const tx = banco.transaction(
            [nome],
            "readwrite"
        );
        const store = tx.objectStore(nome);
        registros.forEach(r => {
            store.put(r);
        });
        tx.oncomplete = () => {
            resolve();
        };
        tx.onerror = e => {
            reject(e);
        };
    });
}
