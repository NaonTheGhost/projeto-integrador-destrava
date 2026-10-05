(function () {
    var CHAVE_SESSAO = "destrava_sessao";
    var usuario = null;

    try {
        usuario = JSON.parse(localStorage.getItem(CHAVE_SESSAO));
    } catch (erro) {
        usuario = null;
    }

    if (!usuario || !usuario.email) usuario = null;

    var email = usuario && usuario.email ? usuario.email.toLowerCase() : "anonimo";
    var CHAVE_OBJETIVO = "destrava:usuario:" + encodeURIComponent(email) + ":objetivo";
    var OBJETIVO_PADRAO = {
        titulo: "Cientista de Dados",
        descricao: "Profissional que analisa dados e usa estatística, programação e visualização para apoiar decisões."
    };

    function lerObjetivo() {
        try {
            var objetivo = JSON.parse(localStorage.getItem(CHAVE_OBJETIVO));
            if (objetivo && typeof objetivo.titulo === "string" && objetivo.titulo.trim()) {
                return {
                    titulo: objetivo.titulo.trim(),
                    descricao: typeof objetivo.descricao === "string" ? objetivo.descricao : OBJETIVO_PADRAO.descricao
                };
            }
        } catch (erro) {
            return OBJETIVO_PADRAO;
        }
        return OBJETIVO_PADRAO;
    }

    function atualizarObjetivoNaTela() {
        var objetivo = lerObjetivo();
        document.querySelectorAll("[data-objetivo-titulo]").forEach(function (elemento) {
            elemento.textContent = objetivo.titulo;
        });
        document.querySelectorAll("[data-objetivo-descricao]").forEach(function (elemento) {
            elemento.textContent = objetivo.descricao;
        });
    }

    window.Destrava = {
        usuario: usuario,
        chave: function (nome) {
            return "destrava:usuario:" + encodeURIComponent(email) + ":" + nome;
        },
        lerObjetivo: lerObjetivo,
        salvarObjetivo: function (objetivo) {
            var salvo = {
                titulo: objetivo.titulo.trim(),
                descricao: objetivo.descricao.trim() || OBJETIVO_PADRAO.descricao
            };
            localStorage.setItem(CHAVE_OBJETIVO, JSON.stringify(salvo));
            atualizarObjetivoNaTela();
            window.dispatchEvent(new CustomEvent("destrava:objetivo-atualizado"));
        }
    };

    atualizarObjetivoNaTela();
    window.addEventListener("storage", function (evento) {
        if (evento.key === CHAVE_OBJETIVO) atualizarObjetivoNaTela();
    });

    if (!usuario && document.body.dataset.authRequired === "true") {
        window.location.replace("../index.html");
        return;
    }

    if (usuario) {
        var nome = (usuario.nome || "Mariana").trim();
        var primeiroNome = nome.split(/\s+/)[0];

        document.querySelectorAll(".app-user__greeting strong").forEach(function (elemento) {
            elemento.textContent = primeiroNome;
        });
        document.querySelectorAll(".app-user__avatar").forEach(function (elemento) {
            elemento.textContent = primeiroNome.charAt(0).toUpperCase();
        });

        var boasVindas = document.querySelector(".cabecalho h1");
        if (boasVindas) boasVindas.textContent = "Olá, " + primeiroNome + "! Bem-vinda de volta.";
    }

    document.querySelectorAll(".app-user").forEach(function (perfil) {
        perfil.addEventListener("click", function () {
            localStorage.removeItem(CHAVE_SESSAO);
        });
    });
})();