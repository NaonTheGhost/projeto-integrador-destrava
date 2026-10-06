(function () {
    var CHAVE_CONTAS = "destrava_contas";
    var CHAVE_SESSAO = "destrava_sessao";
    var CHAVE_MIGRACAO = "destrava_migracao_contas_v1";

    function lerContas() {
        try {
            var contas = JSON.parse(localStorage.getItem(CHAVE_CONTAS) || "[]");
            return Array.isArray(contas) ? contas : [];
        } catch (erro) {
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
        for (var i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(texto.slice(i * 2, i * 2 + 2), 16);
        }
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

            if (tarefasAntigas && !localStorage.getItem(chaveTarefas)) {
                localStorage.setItem(chaveTarefas, tarefasAntigas);
            }
            if (competenciasAntigas && !localStorage.getItem(chaveCompetencias)) {
                localStorage.setItem(chaveCompetencias, competenciasAntigas);
            }
            localStorage.setItem(CHAVE_MIGRACAO, "true");
        }

        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            email: conta.email,
            nome: conta.nome
        }));
    }

    window.DestravaAuth = {
        lerContas: lerContas,
        criarHash: criarHash,
        paraHex: paraHex,
        ativarConta: ativarConta,
        emailValido: function (email) {
            return /^\S+@\S+\.\S+$/.test(email.trim());
        }
    };
})();
