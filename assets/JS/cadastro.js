(function () {
    var auth = window.DestravaAuth;
    var form = document.querySelector("#form-cadastro, #form");

    function campo(nome) {
        return form.elements.namedItem(nome);
    }

    function mensagem(campoAlvo, texto) {
        var id = "erro-" + campoAlvo.id;
        var aviso = document.getElementById(id);
        if (!aviso) {
            aviso = document.createElement("p");
            aviso.className = "erro";
            aviso.id = id;
            aviso.setAttribute("role", "alert");
            campoAlvo.insertAdjacentElement("afterend", aviso);
        }
        campoAlvo.setAttribute("aria-invalid", texto ? "true" : "false");
        aviso.textContent = texto || "";
    }

    form.addEventListener("submit", function (evento) {
        evento.preventDefault();

        var nome = campo("nome") || campo("nomeEmpresa");
        var email = campo("email");
        var senha = campo("password") || campo("senha");
        var confirmacao = campo("confirmarSenha") || campo("confirma");
        var emailNormalizado = email.value.trim().toLowerCase();
        var primeiro = null;

        [
            [nome, nome.value.trim().length < 2, "Informe seu nome."],
            [email, !auth.emailValido(emailNormalizado), "Digite um e-mail válido."],
            [senha, senha.value.length < 6, "A senha precisa ter pelo menos 6 caracteres."],
            [confirmacao, confirmacao.value !== senha.value, "As senhas não são iguais."]
        ].forEach(function (validacao) {
            mensagem(validacao[0], validacao[1] ? validacao[2] : "");
            if (validacao[1] && !primeiro) primeiro = validacao[0];
        });

        if (primeiro) {
            primeiro.focus();
            return;
        }
        if (!form.reportValidity()) return;

        var contas = auth.lerContas();
        if (contas.some(function (conta) {
            return conta.email === emailNormalizado;
        })) {
            mensagem(email, "Este e-mail já possui uma conta. Entre pelo login.");
            email.focus();
            return;
        }

        if (!window.crypto || !window.crypto.getRandomValues) {
            mensagem(senha, "Seu navegador não permite criar uma senha protegida.");
            senha.focus();
            return;
        }

        var salt = new Uint8Array(16);
        window.crypto.getRandomValues(salt);
        var contaNova = {
            nome: nome.value.trim(),
            email: emailNormalizado,
            salt: auth.paraHex(salt),
            hash: ""
        };

        auth.criarHash(senha.value, contaNova.salt).then(function (hash) {
            contaNova.hash = hash;
            contas.push(contaNova);

            try {
                localStorage.setItem("destrava_contas", JSON.stringify(contas));
                auth.ativarConta(contaNova);
                window.location.href = "painel.html";
            } catch (erroDeArmazenamento) {
                mensagem(email, "Não foi possível salvar a conta neste navegador.");
                email.focus();
            }
        }).catch(function () {
            mensagem(senha, "Abra o projeto em localhost ou HTTPS para proteger sua senha.");
            senha.focus();
        });
    });
})();
