(function () {
	var CHAVE_TAREFAS = "destrava-tarefas";
	var CHAVE_COMPETENCIAS = "destrava-competencias";
	var statusPercentual = {
		"nao-iniciada": 0,
		"em-andamento": 60,
		desenvolvida: 100
	};

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
		if (!tarefas) return;

		var concluidas = tarefas.filter(function (tarefa) { return tarefa.estado === 2; }).length;
		var andamento = tarefas.filter(function (tarefa) { return tarefa.estado === 1; }).length;
		var pendentes = tarefas.length - concluidas - andamento;
		var percentual = tarefas.length ? Math.round(concluidas / tarefas.length * 100) : 0;
		var percentualElemento = document.querySelector(".percentage");
		var circulo = document.querySelector(".circular-progress");
		var textoResumo = document.querySelector(".progress-text p");

		if (!percentualElemento || !circulo) return;

		percentualElemento.textContent = percentual + "%";
		circulo.style.background = "conic-gradient(var(--accent-green) " + percentual + "%, var(--pending-bg) " + percentual + "%)";
		if (textoResumo) {
			textoResumo.textContent = tarefas.length
				? "Você concluiu " + concluidas + " de " + tarefas.length + " ações do seu plano. Continue avançando na sua jornada."
				: "Você ainda não tem ações cadastradas no seu plano.";
		}

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

	atualizarResumo();
	atualizarCompetencias(true);

	window.addEventListener("storage", function (evento) {
		if (evento.key === CHAVE_TAREFAS) atualizarResumo();
		if (evento.key === CHAVE_COMPETENCIAS) atualizarCompetencias(false);
	});
})();
