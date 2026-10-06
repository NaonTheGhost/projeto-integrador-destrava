(function () {
    var auth = window.DestravaAuth;
    var form = document.getElementById("form-login");
    var email = document.getElementById("input-email");
    var senha = document.getElementById("input-password");
    var lembrar = document.getElementById("input-memory");

    function erro(campo, id, mensagem) {
        campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
        document.getElementById(id).textContent = mensagem || "";
    }

    try {
        var salvo = localStorage.getItem("destrava_email");
        if (salvo) {
            email.value = salvo;
            lembrar.checked = true;
        }
    } catch (erroDeArmazenamento) {
        email.value = "";
    }

    form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        erro(email, "erro-email", "");
        erro(senha, "erro-senha", "");

        var primeiro = null;
        if (!auth.emailValido(email.value)) {
            erro(email, "erro-email", "Digite um e-mail válido, como mariana@exemplo.com.br.");
            primeiro = email;
        }
        if (senha.value.length < 6) {
            erro(senha, "erro-senha", "A senha precisa ter pelo menos 6 caracteres.");
            if (!primeiro) primeiro = senha;
        }
        if (primeiro) {
            primeiro.focus();
            return;
        }

        var emailNormalizado = email.value.trim().toLowerCase();
        var conta = auth.lerContas().find(function (item) {
            return item.email === emailNormalizado;
        });
        if (!conta) {
            erro(email, "erro-email", "Não encontramos uma conta com esse e-mail. Crie seu cadastro primeiro.");
            email.focus();
            return;
        }

        auth.criarHash(senha.value, conta.salt).then(function (hash) {
            if (hash !== conta.hash) {
                erro(senha, "erro-senha", "E-mail ou senha incorretos.");
                senha.focus();
                return;
            }

            try {
                if (lembrar.checked) localStorage.setItem("destrava_email", emailNormalizado);
                else localStorage.removeItem("destrava_email");
                auth.ativarConta(conta);
                window.location.href = "pages/inicio.html";
            } catch (erroDeArmazenamento) {
                erro(senha, "erro-senha", "Não foi possível salvar sua sessão neste navegador.");
            }
        }).catch(function () {
            erro(senha, "erro-senha", "Não foi possível validar a senha. Abra o projeto em localhost ou HTTPS.");
        });
    });
})();
