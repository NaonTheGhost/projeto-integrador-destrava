(function () {
    function configurarCarrossel(id, botaoAnteriorId, botaoProximoId) {
        var carrossel = document.getElementById(id);
        var anterior = document.getElementById(botaoAnteriorId);
        var proximo = document.getElementById(botaoProximoId);

        if (!carrossel || !anterior || !proximo) return;

        function atualizarBotoes() {
            var maximo = carrossel.scrollWidth - carrossel.clientWidth;
            anterior.disabled = carrossel.scrollLeft <= 1;
            proximo.disabled = carrossel.scrollLeft >= maximo - 1;
        }

        function mover(direcao) {
            var primeiroCard = carrossel.firstElementChild;
            if (!primeiroCard) return;

            var estilo = window.getComputedStyle(carrossel);
            var espaco = parseFloat(estilo.columnGap || estilo.gap) || 0;
            carrossel.scrollBy({
                left: direcao * (primeiroCard.getBoundingClientRect().width + espaco),
                behavior: "smooth"
            });
        }

        anterior.addEventListener("click", function () {
            mover(-1);
        });
        proximo.addEventListener("click", function () {
            mover(1);
        });
        carrossel.addEventListener("scroll", atualizarBotoes, { passive: true });
        window.addEventListener("resize", atualizarBotoes);
        atualizarBotoes();
    }

    configurarCarrossel("carrosselCursos", "cursoAnterior", "cursoProximo");
    configurarCarrossel("carrosselVagas", "vagaAnterior", "vagaProxima");
})();
