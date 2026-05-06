const STORAGE_KEY = "academia-tracker-v1";

const estadoInicial = {
  tema: "claro",
  meta: {
    dataInicial: "",
    dataFinal: "",
    expectativa: "",
    pesoInicial: "",
    pesoFinal: "",
    resultadoFinal: "",
    statusFinal: ""
  },
  treinos: [],
  historico: [],
  metasSalvas: []
};

let estado = carregarDados();
estado.meta = { ...estadoInicial.meta, ...(estado.meta || {}) };
estado.treinos = estado.treinos || [];
estado.historico = estado.historico || [];
estado.metasSalvas = estado.metasSalvas || [];

const formMeta = document.getElementById("formMeta");
const formTreino = document.getElementById("formTreino");
const listaTreinos = document.getElementById("listaTreinos");
const historicoEl = document.getElementById("historico");
const filtroDia = document.getElementById("filtroDia");
const btnTema = document.getElementById("btnTema");
const limparHistorico = document.getElementById("limparHistorico");
const btnAjuda = document.getElementById("btnAjuda");
const btnConfig = document.getElementById("btnConfig");
const modalAjuda = document.getElementById("modalAjuda");
const fecharAjuda = document.getElementById("fecharAjuda");
const modalConfig = document.getElementById("modalConfig");
const fecharConfig = document.getElementById("fecharConfig");
const btnVerMetasSalvas = document.getElementById("btnVerMetasSalvas");
const listaMetasSalvas = document.getElementById("listaMetasSalvas");
const comparacaoFinal = document.getElementById("comparacaoFinal");
const conteudoFinal = document.getElementById("conteudoFinal");
const textoBloqueio = document.getElementById("textoBloqueio");
const expectativaFinalTexto = document.getElementById("expectativaFinalTexto");
const pesoFinal = document.getElementById("pesoFinal");
const resultadoFinal = document.getElementById("resultadoFinal");
const btnAtingido = document.getElementById("btnAtingido");
const btnNaoAtingido = document.getElementById("btnNaoAtingido");
const mensagemFinal = document.getElementById("mensagemFinal");
const btnNovaMeta = document.getElementById("btnNovaMeta");
const modalEditarTreino = document.getElementById("modalEditarTreino");
const fecharEditarTreino = document.getElementById("fecharEditarTreino");
const editNomeTreino = document.getElementById("editNomeTreino");
const editDiaTreino = document.getElementById("editDiaTreino");
const editExerciciosTreino = document.getElementById("editExerciciosTreino");
const salvarSoEsteTreino = document.getElementById("salvarSoEsteTreino");
const salvarTodosDia = document.getElementById("salvarTodosDia");
let treinoEditandoId = null;
let diaOriginalEditando = "";


const camposMetaPrincipais = ["dataInicial", "dataFinal", "expectativa", "pesoInicial"];

function normalizarClasseAvaliacao(avaliacao) {
  if (avaliacao === "Bom") return "bom";
  if (avaliacao === "Médio") return "medio";
  if (avaliacao === "Ruim") return "ruim";
  return "";
}

function aplicarCorSelectAvaliacao(select) {
  select.classList.remove("avaliacao-bom", "avaliacao-medio", "avaliacao-ruim");
  const classe = normalizarClasseAvaliacao(select.value);
  if (classe) select.classList.add(`avaliacao-${classe}`);
}

function metaChegouNoUltimoDia() {
  if (!estado.meta.dataFinal) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const final = new Date(estado.meta.dataFinal + "T00:00:00");
  return hoje >= final;
}

function carregarDados() {
  const dados = localStorage.getItem(STORAGE_KEY);
  try {
    return dados ? JSON.parse(dados) : structuredClone(estadoInicial);
  } catch (erro) {
    console.error("Erro ao carregar dados salvos:", erro);
    return structuredClone(estadoInicial);
  }
}

function salvarDados(atualizar = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  if (atualizar) 
document.addEventListener("click", () => {
  document.querySelectorAll(".menu-opcoes").forEach(menu => menu.classList.add("hidden"));
});

fecharEditarTreino.addEventListener("click", fecharModalEditarTreino);
modalEditarTreino.addEventListener("click", e => {
  if (e.target === modalEditarTreino) fecharModalEditarTreino();
});
salvarSoEsteTreino.addEventListener("click", () => salvarEdicaoTreino(false));
salvarTodosDia.addEventListener("click", () => salvarEdicaoTreino(true));

atualizarTela();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function aplicarTema() {
  document.body.classList.toggle("dark", estado.tema === "escuro");
  btnTema.textContent = estado.tema === "escuro" ? "☀️ Tema" : "🌙 Tema";
}

function preencherMeta() {
  camposMetaPrincipais.forEach(campo => {
    document.getElementById(campo).value = estado.meta[campo] || "";
  });
  pesoFinal.value = estado.meta.pesoFinal || "";
  resultadoFinal.value = estado.meta.resultadoFinal || "";
  expectativaFinalTexto.textContent = estado.meta.expectativa || "Nenhuma expectativa cadastrada.";
}

function salvarMeta(e) {
  e.preventDefault();
  camposMetaPrincipais.forEach(campo => {
    estado.meta[campo] = document.getElementById(campo).value;
  });
  salvarDados();
  alert("Meta salva com sucesso!");
}

function adicionarTreino(e) {
  e.preventDefault();

  const nome = document.getElementById("nomeTreino").value.trim();
  const dia = document.getElementById("diaTreino").value;
  const exercicios = document.getElementById("exerciciosTreino").value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  if (!nome || exercicios.length === 0) return;

  estado.treinos.push({ id: uid(), nome, dia, exercicios });
  formTreino.reset();
  salvarDados();
}

function renderTreinos() {
  listaTreinos.innerHTML = "";

  const diaSelecionado = filtroDia.value;
  const treinosFiltrados = estado.treinos.filter(treino => diaSelecionado === "Todos" || treino.dia === diaSelecionado);

  if (treinosFiltrados.length === 0) {
    listaTreinos.innerHTML = '<div class="vazio">Nenhum treino cadastrado para esse filtro.</div>';
    return;
  }

  treinosFiltrados.forEach(treino => {
    const template = document.getElementById("templateTreino");
    const item = template.content.cloneNode(true);
    const card = item.querySelector(".treino-item");

    card.querySelector("h3").textContent = treino.nome;
    card.querySelector(".treino-head p").textContent = treino.dia;

    const checklist = card.querySelector(".checklist");
    treino.exercicios.forEach((exercicio, index) => {
      const label = document.createElement("label");
      label.className = "check-item";
      label.innerHTML = `<input type="checkbox" data-index="${index}"><span>${exercicio}</span>`;
      label.querySelector("input").addEventListener("change", event => {
        label.classList.toggle("feito", event.target.checked);
      });
      checklist.appendChild(label);
    });

    const btnMenuTreino = card.querySelector(".menu-treino");
    const menuOpcoes = card.querySelector(".menu-opcoes");
    btnMenuTreino.addEventListener("click", event => {
      event.stopPropagation();
      document.querySelectorAll(".menu-opcoes").forEach(menu => {
        if (menu !== menuOpcoes) menu.classList.add("hidden");
      });
      menuOpcoes.classList.toggle("hidden");
    });

    card.querySelector(".editar").addEventListener("click", () => abrirEditarTreino(treino.id));

    card.querySelector(".remover").addEventListener("click", () => {
      if (confirm("Tem certeza que deseja excluir esse treino?")) {
        estado.treinos = estado.treinos.filter(t => t.id !== treino.id);
        salvarDados();
      }
    });

    const selectAvaliacao = card.querySelector(".avaliacao");
    selectAvaliacao.addEventListener("change", () => aplicarCorSelectAvaliacao(selectAvaliacao));

    card.querySelector(".concluir").addEventListener("click", () => concluirTreino(treino, checklist, card));
    listaTreinos.appendChild(item);
  });
}

function concluirTreino(treino, checklist, item) {
  const checks = [...checklist.querySelectorAll("input[type='checkbox']")];
  const feitos = checks.filter(check => check.checked).length;
  const avaliacao = item.querySelector(".avaliacao").value;
  const observacao = item.querySelector(".observacao").value.trim();

  if (!avaliacao) {
    alert("Escolha a avaliação do treino: bom, médio ou ruim.");
    return;
  }

  estado.historico.unshift({
    id: uid(),
    treinoId: treino.id,
    nome: treino.nome,
    dia: treino.dia,
    data: new Date().toLocaleDateString("pt-BR"),
    avaliacao,
    observacao,
    feitos,
    total: treino.exercicios.length
  });

  salvarDados();
  alert("Treino concluído e salvo no histórico!");
}


function abrirEditarTreino(id) {
  const treino = estado.treinos.find(item => item.id === id);
  if (!treino) return;

  treinoEditandoId = id;
  diaOriginalEditando = treino.dia;
  editNomeTreino.value = treino.nome;
  editDiaTreino.value = treino.dia;
  editExerciciosTreino.value = treino.exercicios.join("\n");
  modalEditarTreino.classList.remove("hidden");
  document.querySelectorAll(".menu-opcoes").forEach(menu => menu.classList.add("hidden"));
}

function fecharModalEditarTreino() {
  modalEditarTreino.classList.add("hidden");
  treinoEditandoId = null;
  diaOriginalEditando = "";
}

function obterDadosEdicaoTreino() {
  const nome = editNomeTreino.value.trim();
  const dia = editDiaTreino.value;
  const exercicios = editExerciciosTreino.value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  if (!nome || !dia || exercicios.length === 0) {
    alert("Preencha nome, dia e pelo menos um exercício.");
    return null;
  }

  return { nome, dia, exercicios };
}

function salvarEdicaoTreino(aplicarTodosDoDia = false) {
  if (!treinoEditandoId) return;
  const dados = obterDadosEdicaoTreino();
  if (!dados) return;

  if (aplicarTodosDoDia) {
    if (!confirm(`Salvar essa alteração em todos os treinos cadastrados na ${diaOriginalEditando}?`)) return;
    estado.treinos = estado.treinos.map(treino => {
      if (treino.dia === diaOriginalEditando) return { ...treino, ...dados };
      return treino;
    });
  } else {
    estado.treinos = estado.treinos.map(treino => {
      if (treino.id === treinoEditandoId) return { ...treino, ...dados };
      return treino;
    });
  }

  fecharModalEditarTreino();
  salvarDados();
  alert("Treino atualizado com sucesso!");
}

function renderHistorico() {
  historicoEl.innerHTML = "";

  if (estado.historico.length === 0) {
    historicoEl.innerHTML = '<div class="vazio">Seu histórico ainda está vazio.</div>';
    return;
  }

  estado.historico.forEach(registro => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <strong>${registro.nome}</strong>
      <span class="badge badge-${normalizarClasseAvaliacao(registro.avaliacao)}">${registro.avaliacao}</span>
      <span>${registro.data} • ${registro.dia}</span>
      <span>Checklist: ${registro.feitos}/${registro.total} exercícios concluídos</span>
      <span>${registro.observacao || "Sem observação."}</span>
    `;
    historicoEl.appendChild(div);
  });
}

function todosTreinosConcluidos() {
  if (estado.treinos.length === 0) return false;
  return estado.treinos.every(treino => estado.historico.some(registro => registro.treinoId === treino.id));
}

function renderComparacaoFinal() {
  const treinosConcluidos = todosTreinosConcluidos();
  const chegouNoUltimoDia = metaChegouNoUltimoDia();
  const liberado = treinosConcluidos && chegouNoUltimoDia;

  comparacaoFinal.classList.toggle("bloqueado", !liberado);
  conteudoFinal.classList.toggle("hidden", !liberado);

  const concluidosUnicos = new Set(estado.historico.map(item => item.treinoId)).size;

  if (liberado) {
    textoBloqueio.textContent = "Você concluiu os treinos e chegou no último dia da meta. Agora faça seu resultado final.";
  } else if (!estado.meta.dataFinal) {
    textoBloqueio.textContent = `Cadastre a data final da meta. Depois, o resultado final será liberado somente no último dia, quando os treinos forem concluídos. Progresso: ${concluidosUnicos}/${estado.treinos.length}.`;
  } else if (!chegouNoUltimoDia) {
    const dataBR = new Date(estado.meta.dataFinal + "T00:00:00").toLocaleDateString("pt-BR");
    textoBloqueio.textContent = `O resultado final só será liberado no último dia da meta: ${dataBR}. Continue concluindo seus treinos até lá. Progresso: ${concluidosUnicos}/${estado.treinos.length}.`;
  } else {
    textoBloqueio.textContent = `Você já chegou no último dia da meta. Conclua todos os treinos cadastrados para liberar o resultado final. Progresso: ${concluidosUnicos}/${estado.treinos.length}.`;
  }

  expectativaFinalTexto.textContent = estado.meta.expectativa || "Nenhuma expectativa cadastrada.";
  renderMensagemFinal();
}

function salvarFeedbackFinal(status) {
  estado.meta.pesoFinal = pesoFinal.value;
  estado.meta.resultadoFinal = resultadoFinal.value.trim();
  estado.meta.statusFinal = status;
  salvarDados();
}

function renderMensagemFinal() {
  mensagemFinal.className = "mensagem-final hidden";
  mensagemFinal.innerHTML = "";
  btnNovaMeta.classList.add("hidden");

  if (estado.meta.statusFinal === "atingido") {
    mensagemFinal.className = "mensagem-final festa";
    mensagemFinal.innerHTML = "🎉 Meta atingida! Você foi consistente, cumpriu seus treinos e chegou no resultado. Agora é continuar evoluindo e subir o próximo nível.";
    btnNovaMeta.classList.remove("hidden");
  }

  if (estado.meta.statusFinal === "nao") {
    mensagemFinal.className = "mensagem-final forca";
    mensagemFinal.innerHTML = "Você ainda não atingiu a meta, mas isso não apaga sua evolução. O mais importante é que você treinou, registrou seu progresso e não desistiu. Parabéns por continuar.";
    btnNovaMeta.classList.remove("hidden");
  }
}

function salvarMetaAtualEReiniciar() {
  if (!estado.meta.statusFinal) {
    alert("Finalize a comparação antes de começar uma nova meta.");
    return;
  }

  if (!confirm("Deseja salvar essa meta finalizada e começar uma nova?")) return;

  const metaArquivada = {
    id: uid(),
    salvaEm: new Date().toLocaleDateString("pt-BR"),
    meta: { ...estado.meta },
    treinos: structuredClone(estado.treinos),
    historico: structuredClone(estado.historico)
  };

  estado.metasSalvas.unshift(metaArquivada);
  estado.meta = structuredClone(estadoInicial.meta);
  estado.treinos = [];
  estado.historico = [];
  filtroDia.value = "Todos";
  salvarDados();
  alert("Meta salva! Agora você pode começar uma nova.");
}

function renderMetasSalvas() {
  listaMetasSalvas.innerHTML = "";

  if (!estado.metasSalvas.length) {
    listaMetasSalvas.innerHTML = '<div class="vazio">Nenhuma meta salva ainda.</div>';
    return;
  }

  estado.metasSalvas.forEach(metaSalva => {
    const status = metaSalva.meta.statusFinal === "atingido" ? "Atingida" : "Não atingida";
    const div = document.createElement("div");
    div.className = "meta-salva-item";
    div.innerHTML = `
      <div class="meta-salva-topo">
        <div>
          <strong>${status} • salva em ${metaSalva.salvaEm}</strong>
          <p>${metaSalva.meta.dataInicial || "Sem início"} até ${metaSalva.meta.dataFinal || "Sem final"}</p>
        </div>
        <button class="btn danger small excluir-meta" type="button">Excluir</button>
      </div>
      <p><strong>Expectativa:</strong> ${metaSalva.meta.expectativa || "Sem expectativa."}</p>
      <p><strong>Feedback:</strong> ${metaSalva.meta.resultadoFinal || "Sem feedback."}</p>
      <p><strong>Peso:</strong> ${metaSalva.meta.pesoInicial || "--"} kg → ${metaSalva.meta.pesoFinal || "--"} kg</p>
      <p><strong>Treinos concluídos:</strong> ${metaSalva.historico.length}</p>
    `;

    div.querySelector(".excluir-meta").addEventListener("click", () => {
      if (confirm("Deseja excluir essa meta salva?")) {
        estado.metasSalvas = estado.metasSalvas.filter(item => item.id !== metaSalva.id);
        salvarDados(false);
        renderMetasSalvas();
      }
    });

    listaMetasSalvas.appendChild(div);
  });
}

function atualizarDashboard() {
  document.getElementById("totalTreinos").textContent = estado.treinos.length;
  document.getElementById("totalConcluidos").textContent = estado.historico.length;

  const notas = { Ruim: 1, Médio: 2, Bom: 3 };
  if (estado.historico.length > 0) {
    const media = estado.historico.reduce((acc, item) => acc + notas[item.avaliacao], 0) / estado.historico.length;
    let texto = "Ruim";
    if (media >= 2.5) texto = "Bom";
    else if (media >= 1.6) texto = "Médio";
    document.getElementById("mediaAvaliacao").textContent = texto;
  } else {
    document.getElementById("mediaAvaliacao").textContent = "--";
  }

  if (estado.meta.dataFinal) {
    const hoje = new Date();
    const final = new Date(estado.meta.dataFinal + "T00:00:00");
    const diff = Math.ceil((final - hoje) / (1000 * 60 * 60 * 24));
    document.getElementById("diasRestantes").textContent = diff > 0 ? diff : "0";
  } else {
    document.getElementById("diasRestantes").textContent = "--";
  }
}

function atualizarTela() {
  aplicarTema();
  preencherMeta();
  renderTreinos();
  renderHistorico();
  renderComparacaoFinal();
  atualizarDashboard();
}

formMeta.addEventListener("submit", salvarMeta);
formTreino.addEventListener("submit", adicionarTreino);
filtroDia.addEventListener("change", renderTreinos);

btnTema.addEventListener("click", () => {
  estado.tema = estado.tema === "escuro" ? "claro" : "escuro";
  salvarDados();
});

btnAjuda.addEventListener("click", () => modalAjuda.classList.remove("hidden"));
fecharAjuda.addEventListener("click", () => modalAjuda.classList.add("hidden"));
modalAjuda.addEventListener("click", e => {
  if (e.target === modalAjuda) modalAjuda.classList.add("hidden");
});

btnConfig.addEventListener("click", () => {
  modalConfig.classList.remove("hidden");
  listaMetasSalvas.classList.add("hidden");
});
fecharConfig.addEventListener("click", () => modalConfig.classList.add("hidden"));
modalConfig.addEventListener("click", e => {
  if (e.target === modalConfig) modalConfig.classList.add("hidden");
});
btnVerMetasSalvas.addEventListener("click", () => {
  listaMetasSalvas.classList.toggle("hidden");
  if (!listaMetasSalvas.classList.contains("hidden")) renderMetasSalvas();
});

limparHistorico.addEventListener("click", () => {
  if (confirm("Deseja apagar todo o histórico de treinos?")) {
    estado.historico = [];
    estado.meta.statusFinal = "";
    salvarDados();
  }
});

[pesoFinal, resultadoFinal].forEach(campo => {
  campo.addEventListener("input", () => {
    estado.meta.pesoFinal = pesoFinal.value;
    estado.meta.resultadoFinal = resultadoFinal.value;
    salvarDados(false);
  });
});

btnAtingido.addEventListener("click", () => salvarFeedbackFinal("atingido"));
btnNaoAtingido.addEventListener("click", () => salvarFeedbackFinal("nao"));
btnNovaMeta.addEventListener("click", salvarMetaAtualEReiniciar);


document.addEventListener("click", () => {
  document.querySelectorAll(".menu-opcoes").forEach(menu => menu.classList.add("hidden"));
});

fecharEditarTreino.addEventListener("click", fecharModalEditarTreino);
modalEditarTreino.addEventListener("click", e => {
  if (e.target === modalEditarTreino) fecharModalEditarTreino();
});
salvarSoEsteTreino.addEventListener("click", () => salvarEdicaoTreino(false));
salvarTodosDia.addEventListener("click", () => salvarEdicaoTreino(true));

atualizarTela();