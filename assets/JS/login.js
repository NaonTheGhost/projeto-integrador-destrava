(function () {
    var paineis = {
        login: document.getElementById("painel-login"),
        cadastro: document.getElementById("painel-cadastro"),
        sucesso: document.getElementById("painel-sucesso")
    };
    var titulos = { login: "Login | Destrava +", cadastro: "Cadastro | Destrava +" };

    function mostrar(nome) {
        for (var k in paineis) paineis[k].hidden = (k !== nome);
        if (titulos[nome]) document.title = titulos[nome];
        if (nome === "login" || nome === "cadastro") {
            var primeiro = paineis[nome].querySelector("input");
            if (primeiro) primeiro.focus();
        }
    }

    function erro(campo, id, texto) {
        campo.setAttribute("aria-invalid", texto ? "true" : "false");
        document.getElementById(id).textContent = texto || "";
    }

    var emailOk = function (v) { return /^\S+@\S+\.\S+$/.test(v.trim()); };

    // Troca entre login e cadastro
    var botoes = document.querySelectorAll("[data-ir]");
    for (var i = 0; i < botoes.length; i++) {
        botoes[i].addEventListener("click", function (e) {
            var destino = e.currentTarget.getAttribute("data-ir");
            mostrar(destino);
            history.replaceState(null, "", destino === "cadastro" ? "#cadastro" : "#login");
        });
    }

    // ===== LOGIN =====
    var email = document.getElementById("input-email");
    var senha = document.getElementById("input-password");
    var lembrar = document.getElementById("input-memory");

    try {
        var salvo = localStorage.getItem("destrava_email");
        if (salvo) { email.value = salvo; lembrar.checked = true; }
    } catch (e) {}

    document.getElementById("form-login").addEventListener("submit", function (ev) {
        ev.preventDefault();
        var primeiro = null;
        erro(email, "erro-email", "");
        erro(senha, "erro-senha", "");

        if (!emailOk(email.value)) {
            erro(email, "erro-email", "Digite um e-mail válido, como mariana@exemplo.com.br.");
            primeiro = email;
        }
        if (senha.value.length < 6) {
            erro(senha, "erro-senha", "A senha precisa ter pelo menos 6 caracteres.");
            if (!primeiro) primeiro = senha;
        }
        if (primeiro) { primeiro.focus(); return; }

        try {
            if (lembrar.checked) localStorage.setItem("destrava_email", email.value.trim());
            else localStorage.removeItem("destrava_email");
        } catch (e) {}

        // TODO: conectar com o backend. Exemplo:
        // fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ email: email.value.trim(), senha: senha.value }) })
        //   .then(function (r) { if (r.ok) window.location.href = "pages/dashboard.html"; });
        console.log("Login válido, pronto para enviar ao servidor.");
    });

    // ===== CADASTRO =====
    var cNome = document.getElementById("cad-nome");
    var cEmail = document.getElementById("cad-email");
    var cSenha = document.getElementById("cad-senha");
    var cConf = document.getElementById("cad-confirma");

    document.getElementById("form-cadastro").addEventListener("submit", function (ev) {
        ev.preventDefault();
        var primeiro = null;
        function checar(campo, id, falhou, msg) {
            erro(campo, id, falhou ? msg : "");
            if (falhou && !primeiro) primeiro = campo;
        }

        checar(cNome, "erro-cad-nome", cNome.value.trim().length < 2, "Informe seu nome.");
        checar(cEmail, "erro-cad-email", !emailOk(cEmail.value), "Digite um e-mail válido, como mariana@exemplo.com.br.");
        checar(cSenha, "erro-cad-senha", cSenha.value.length < 6, "A senha precisa ter pelo menos 6 caracteres.");
        checar(cConf, "erro-cad-confirma", cConf.value !== cSenha.value, "As senhas não são iguais.");
        if (primeiro) { primeiro.focus(); return; }

        // TODO: conectar com o backend. Exemplo:
        // fetch("/api/cadastro", { method: "POST", headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ nome: cNome.value.trim(), email: cEmail.value.trim(), senha: cSenha.value }) });
        document.getElementById("sucesso-titulo").textContent = "Conta criada";
        document.getElementById("sucesso-texto").textContent =
            "Bem-vinda ao Destrava +, " + cNome.value.trim().split(" ")[0] + ". Agora é só entrar.";
        email.value = cEmail.value.trim();
        mostrar("sucesso");
    });

    document.getElementById("sucesso-voltar").addEventListener("click", function () {
        mostrar("login");
        history.replaceState(null, "", "#login");
        senha.focus();
    });

    // Abre direto no cadastro se o link for index.html#cadastro
    if (location.hash === "#cadastro") mostrar("cadastro");
})();