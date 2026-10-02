(function () {
    var CHAVE_CONTAS = "destrava_contas";
    var CHAVE_SESSAO = "destrava_sessao";
    var CHAVE_MIGRACAO = "destrava_migracao_contas_v1";
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

    function lerContas() {
        try {
            var contas = JSON.parse(localStorage.getItem(CHAVE_CONTAS) || "[]");
            return Array.isArray(contas) ? contas : [];
        } catch (e) {
            return [];
        }
    }

    function paraHex(bytes) {
        return Array.prototype.map.call(bytes, function (byte) {
            return byte.toString(16).padStart(2, "0");
        }).join("");
    }

    function deHex(texto) {
        var bytes = new Uint8Array(texto.length / 2);
        for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(texto.slice(i * 2, i * 2 + 2), 16);
        return bytes;
    }

    function criarHash(senha, saltHex) {
        if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
            return Promise.reject(new Error("crypto-indisponivel"));
        }

        return window.crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(senha),
            "PBKDF2",
            false,
            ["deriveBits"]
        ).then(function (chave) {
            return window.crypto.subtle.deriveBits({
                name: "PBKDF2",
                salt: deHex(saltHex),
                iterations: 120000,
                hash: "SHA-256"
            }, chave, 256);
        }).then(function (resultado) {
            return paraHex(new Uint8Array(resultado));
        });
    }

    function ativarConta(conta) {
        if (!localStorage.getItem(CHAVE_MIGRACAO)) {
            var chaveTarefas = "destrava:usuario:" + encodeURIComponent(conta.email) + ":tarefas";
            var chaveCompetencias = "destrava:usuario:" + encodeURIComponent(conta.email) + ":competencias";
            var tarefasAntigas = localStorage.getItem("destrava-tarefas");
            var competenciasAntigas = localStorage.getItem("destrava-competencias");

            if (tarefasAntigas && !localStorage.getItem(chaveTarefas)) localStorage.setItem(chaveTarefas, tarefasAntigas);
            if (competenciasAntigas && !localStorage.getItem(chaveCompetencias)) localStorage.setItem(chaveCompetencias, competenciasAntigas);
            localStorage.setItem(CHAVE_MIGRACAO, "true");
        }

        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            email: conta.email,
            nome: conta.nome
        }));
    }

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

        var emailNormalizado = email.value.trim().toLowerCase();
        var conta = lerContas().find(function (item) { return item.email === emailNormalizado; });
        if (!conta) {
            erro(email, "erro-email", "Não encontramos uma conta com esse e-mail. Crie seu cadastro primeiro.");
            email.focus();
            return;
        }

        criarHash(senha.value, conta.salt).then(function (hash) {
            if (hash !== conta.hash) {
                erro(senha, "erro-senha", "E-mail ou senha incorretos.");
                senha.focus();
                return;
            }

            try {
                if (lembrar.checked) localStorage.setItem("destrava_email", emailNormalizado);
                else localStorage.removeItem("destrava_email");
                ativarConta(conta);
                window.location.href = "pages/home.html";
            } catch (e) {
                erro(senha, "erro-senha", "Não foi possível salvar sua sessão neste navegador.");
            }
        }).catch(function () {
            erro(senha, "erro-senha", "Não foi possível validar a senha. Abra o projeto em localhost ou HTTPS.");
        });
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

        var emailNormalizado = cEmail.value.trim().toLowerCase();
        checar(cNome, "erro-cad-nome", cNome.value.trim().length < 2, "Informe seu nome.");
        checar(cEmail, "erro-cad-email", !emailOk(emailNormalizado), "Digite um e-mail válido, como mariana@exemplo.com.br.");
        checar(cSenha, "erro-cad-senha", cSenha.value.length < 6, "A senha precisa ter pelo menos 6 caracteres.");
        checar(cConf, "erro-cad-confirma", cConf.value !== cSenha.value, "As senhas não são iguais.");
        if (primeiro) { primeiro.focus(); return; }

        var contas = lerContas();
        if (contas.some(function (conta) { return conta.email === emailNormalizado; })) {
            erro(cEmail, "erro-cad-email", "Este e-mail já possui uma conta. Entre pelo login.");
            cEmail.focus();
            return;
        }

        var salt = new Uint8Array(16);
        if (!window.crypto || !window.crypto.getRandomValues) {
            erro(cSenha, "erro-cad-senha", "Seu navegador não permite criar uma senha protegida.");
            cSenha.focus();
            return;
        }
        window.crypto.getRandomValues(salt);
        var contaNova = {
            nome: cNome.value.trim(),
            email: emailNormalizado,
            salt: paraHex(salt),
            hash: ""
        };

        criarHash(cSenha.value, contaNova.salt).then(function (hash) {
            contaNova.hash = hash;
            contas.push(contaNova);

            try {
                localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
                ativarConta(contaNova);
                document.getElementById("sucesso-titulo").textContent = "Conta criada";
                document.getElementById("sucesso-texto").textContent =
                    "Bem-vinda ao Destrava +, " + contaNova.nome.split(" ")[0] + ". Seu painel já está pronto.";
                document.getElementById("sucesso-voltar").textContent = "Acessar meu painel";
                email.value = contaNova.email;
                mostrar("sucesso");
            } catch (e) {
                erro(cEmail, "erro-cad-email", "Não foi possível salvar a conta neste navegador.");
                cEmail.focus();
            }
        }).catch(function () {
            erro(cSenha, "erro-cad-senha", "Abra o projeto em localhost ou HTTPS para proteger sua senha.");
            cSenha.focus();
        });
    });

    document.getElementById("sucesso-voltar").addEventListener("click", function () {
        window.location.href = "pages/home.html";
    });

    // Abre direto no cadastro se o link for index.html#cadastro
    if (location.hash === "#cadastro") mostrar("cadastro");
})();