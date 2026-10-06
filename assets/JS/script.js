(function () {
	var CHAVE_TAREFAS = window.Destrava.chave("tarefas");
	var CHAVE_COMPETENCIAS = window.Destrava.chave("competencias");
	var CHAVE_OBJETIVO = window.Destrava.chave("objetivo");
	var formObjetivo = document.getElementById("formObjetivo");
	var botaoAlterar = document.getElementById("botaoAlterar");
	var botaoCancelar = document.getElementById("botaoCancelar");
	var statusPercentual = {
		"nao-iniciada": 0,
		"em-andamento": 50,
		desenvolvida: 100
	};

	function prepararObjetivo() {
		if (!formObjetivo || !botaoAlterar) return;

		var campoTitulo = document.getElementById("campoTitulo");
		var campoDescricao = document.getElementById("campoDescricao");

		function preencherCampos() {
			var objetivo = window.Destrava.lerObjetivo();
			campoTitulo.value = objetivo.titulo;
			campoDescricao.value = objetivo.descricao;
		}

		function fecharFormulario() {
			formObjetivo.hidden = true;
			botaoAlterar.setAttribute("aria-expanded", "false");
		}

		botaoAlterar.addEventListener("click", function () {
			preencherCampos();
			formObjetivo.hidden = false;
			botaoAlterar.setAttribute("aria-expanded", "true");
			campoTitulo.focus();
		});

		if (botaoCancelar) {
			botaoCancelar.addEventListener("click", fecharFormulario);
		}

		formObjetivo.addEventListener("submit", function (evento) {
			evento.preventDefault();
			window.Destrava.salvarObjetivo({
				titulo: campoTitulo.value,
				descricao: campoDescricao.value
			});
			fecharFormulario();
		});
	}

	function lerLista(chave) {
		try {
			var valor = JSON.parse(localStorage.getItem(chave));
			return Array.isArray(valor) ? valor : null;
		} catch (erro) {
			return null;
		}
	}

	function atualizarResumo() {
		var tarefas = lerLista(CHAVE_TAREFAS);
		if (!tarefas) tarefas = [];

		var concluidas = tarefas.filter(function (tarefa) { return tarefa.estado === 2; }).length;
		var andamento = tarefas.filter(function (tarefa) { return tarefa.estado === 1; }).length;
		var pendentes = tarefas.length - concluidas - andamento;
		var percentual = tarefas.length ? Math.round(concluidas / tarefas.length * 100) : 0;
		var percentualElemento = document.querySelector(".percentage");
		var circulo = document.querySelector(".circular-progress");
		var textoResumo = document.querySelector(".progress-text p");

		if (!percentualElemento || !circulo) return;

		percentualElemento.textContent = percentual + "%";
		circulo.style.background = "conic-gradient(var(--color-brand) " + percentual + "%, var(--color-pending-soft) " + percentual + "%)";
		if (textoResumo) {
			textoResumo.textContent = tarefas.length
				? "Você concluiu " + concluidas + " de " + tarefas.length + " ações para seu objetivo de " + window.Destrava.lerObjetivo().titulo + "."
				: "Você ainda não tem ações cadastradas no seu plano.";
		}

		atualizarHistorico(tarefas);

		var contadores = [
			[".status-success strong", concluidas, "Concluída", "Concluídas"],
			[".status-warning strong", andamento, "Em andamento", "Em andamento"],
			[".status-pending strong", pendentes, "Pendente", "Pendentes"]
		];
		contadores.forEach(function (item) {
			var elemento = document.querySelector(item[0]);
			if (elemento) elemento.textContent = item[1] + " " + (item[1] === 1 ? item[2] : item[3]);
		});
	}

	function atualizarHistorico(tarefas) {
		var lista = document.getElementById("listaHistorico");
		if (!lista) return;

		var rotulos = ["Pendente", "Em andamento", "Concluída"];
		var classes = ["pending", "warning", "success"];
		lista.replaceChildren();

		if (!tarefas.length) {
			var vazio = document.createElement("li");
			vazio.className = "activity-item";
			vazio.textContent = "Nenhuma ação cadastrada ainda.";
			lista.appendChild(vazio);
			return;
		}

		tarefas.forEach(function (tarefa) {
			var estado = typeof tarefa.estado === "number" && rotulos[tarefa.estado]
				? tarefa.estado
				: 0;
			var item = document.createElement("li");
			item.className = "activity-item";

			var informacoes = document.createElement("div");
			informacoes.className = "activity-info";
			var ponto = document.createElement("span");
			ponto.className = "dot " + classes[estado];
			var texto = document.createElement("div");
			texto.className = "activity-text";
			var titulo = document.createElement("h4");
			titulo.textContent = tarefa.nome || "Ação sem título";
			var detalhe = document.createElement("span");
			detalhe.className = "date";
			detalhe.textContent = tarefa.prazo ? "Prazo: " + formatarData(tarefa.prazo) : "Ação do plano";
			texto.appendChild(titulo);
			texto.appendChild(detalhe);
			informacoes.appendChild(ponto);
			informacoes.appendChild(texto);

			var status = document.createElement("span");
			status.className = "status-tag " + classes[estado];
			status.textContent = rotulos[estado];
			item.appendChild(informacoes);
			item.appendChild(status);
			lista.appendChild(item);
		});
	}

	function formatarData(data) {
		if (typeof data !== "string") return data;
		var partes = data.split("-");
		return partes.length === 3 ? partes[2] + "/" + partes[1] + "/" + partes[0] : data;
	}

	function atualizarCompetencias(salvar) {
		var cartoes = document.querySelectorAll("[data-status] .card__status");
		if (!cartoes.length) return;

		var competencias = {};
		try {
			competencias = JSON.parse(localStorage.getItem(CHAVE_COMPETENCIAS)) || {};
		} catch (erro) {
			competencias = {};
		}

		cartoes.forEach(function (seletor) {
			var cartao = seletor.closest("[data-status]");
			var nome = cartao.querySelector("h3").textContent.trim();
			var valorSalvo = competencias[nome];
			if (valorSalvo && statusPercentual[valorSalvo] !== undefined) {
				seletor.value = valorSalvo;
			} else {
				competencias[nome] = seletor.value;
			}

			function desenharCompetencia() {
				var percentual = statusPercentual[seletor.value] || 0;
				cartao.dataset.status = seletor.value;
				cartao.querySelector(".barra__preenchida").style.width = percentual + "%";
				cartao.querySelector(".card__progresso").textContent = percentual + "% desenvolvido";
			}

			desenharCompetencia();
			seletor.onchange = function () {
				competencias[nome] = seletor.value;
				localStorage.setItem(CHAVE_COMPETENCIAS, JSON.stringify(competencias));
				desenharCompetencia();
			};
		});

		if (salvar && localStorage.getItem(CHAVE_COMPETENCIAS) === null) {
			localStorage.setItem(CHAVE_COMPETENCIAS, JSON.stringify(competencias));
		}
	}

	prepararObjetivo();
	atualizarResumo();
	atualizarCompetencias(true);

	window.addEventListener("storage", function (evento) {
		if (evento.key === CHAVE_TAREFAS) atualizarResumo();
		if (evento.key === CHAVE_COMPETENCIAS) atualizarCompetencias(false);
		if (evento.key === CHAVE_OBJETIVO) atualizarResumo();
	});
	window.addEventListener("destrava:objetivo-atualizado", atualizarResumo);
})();
