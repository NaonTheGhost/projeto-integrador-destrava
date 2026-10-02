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
    window.Destrava = {
        usuario: usuario,
        chave: function (nome) {
            return "destrava:usuario:" + encodeURIComponent(email) + ":" + nome;
        }
    };

    if (!usuario && document.body.dataset.authRequired === "true") {
        window.location.replace("../index-lc.html");
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
        perfil.addEventListener("click", function (evento) {
            evento.preventDefault();
            localStorage.removeItem(CHAVE_SESSAO);
            window.location.href = perfil.href;
        });
    });
})();