/* =====================================================
   DESTRAVA+ | script.js
   Este arquivo dá vida à página:
     1. Dados (as tarefas)
     2. Referências aos elementos do HTML
     3. Função que desenha a tela
     4. Eventos (cliques)
   ===================================================== */


/* ---------- 1. DADOS ---------- */

// Os 3 status possíveis. A "chave" vira uma classe CSS (cor do selo)
// e o "rotulo" é o texto que aparece para a usuária.
// A ordem importa: é a ordem em que o status muda a cada clique.
const ESTADOS = [
  { chave: 'pendente',  rotulo: 'Pendente' },     // posição 0
  { chave: 'andamento', rotulo: 'Em andamento' }, // posição 1
  { chave: 'concluido', rotulo: 'Concluído' }     // posição 2
];

// Lista de tarefas. "estado" guarda a POSIÇÃO do status no array acima.
// Exemplo: estado 2 = Concluído.
// Para ligar a um banco de dados/API no futuro, é aqui que os dados entrariam.
const TAREFAS_INICIAIS = [
  { nome: 'Estudar lógica de programação',      estado: 2 },
  { nome: 'Aprender Python',                    estado: 1 },
  { nome: 'Criar projeto de análise de dados',  estado: 0 },
  { nome: 'Revisar estatística básica',         estado: 2 },
  { nome: 'Praticar consultas em SQL',          estado: 0 }
];
const CHAVE_TAREFAS = 'destrava-tarefas';

function carregarTarefas() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_TAREFAS));
    if (Array.isArray(salvas)) return salvas;
  } catch (erro) {
    return TAREFAS_INICIAIS;
  }
  return TAREFAS_INICIAIS;
}

const tarefas = carregarTarefas();

function salvarTarefas() {
  localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}

salvarTarefas();

// Controla se a lista mostra todas as tarefas ou só as primeiras
let mostrarTodas = false;
const LIMITE = 3; // quantas tarefas aparecem quando a lista está "fechada"

// Circunferência do anel de progresso (2 × π × raio). O raio 48 é o mesmo do HTML.
// Serve para calcular quanto do círculo deve ficar pintado de verde.
const CIRCUNFERENCIA = 2 * Math.PI * 48;


/* ---------- 2. REFERÊNCIAS AOS ELEMENTOS DO HTML ----------
   getElementById busca um elemento pelo id que colocamos no HTML. */
const lista    = document.getElementById('lista');    // <ul> onde as tarefas aparecem
const valor    = document.getElementById('valor');    // círculo verde do anel
const pct      = document.getElementById('pct');      // texto "40%"
const verTodas = document.getElementById('verTodas'); // botão "Ver todas"

// Prepara o círculo verde: "dasharray" define o tamanho do traço.
// Com o traço do tamanho do círculo inteiro, dá para "esconder" parte dele com o offset.
valor.style.strokeDasharray = CIRCUNFERENCIA;

// Desenho do ícone (círculo com check) que aparece em cada tarefa
const iconeCheck =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">' +
  '<circle cx="8" cy="8" r="6.5"/>' +
  '<path d="M5.2 8.2l2 2 3.6-4" stroke-linecap="round" stroke-linejoin="round"/></svg>';


/* ---------- FUNÇÃO AUXILIAR ----------
   O campo de data entrega "2024-11-15". Aqui viramos "15/11/2024".
   (Cortamos o texto em vez de usar new Date() para evitar erro de fuso horário.) */
function formatarData(iso) {
  const partes = iso.split('-'); // ["2024", "11", "15"]
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}


/* ---------- 3. FUNÇÃO QUE DESENHA A TELA ----------
   Sempre que algo muda (status, nova tarefa, "ver todas"),
   chamamos desenhar() e ela refaz a lista e o anel do zero. */
function desenhar() {

  // 3.1 Decide quais tarefas mostrar: todas ou só as 3 primeiras
  const visiveis = mostrarTodas ? tarefas : tarefas.slice(0, LIMITE);

  // 3.2 Limpa a lista antes de recriar
  lista.innerHTML = '';

  // 3.3 Cria uma linha <li> para cada tarefa visível
  visiveis.forEach(function (tarefa) {
    const estado = ESTADOS[tarefa.estado]; // pega { chave, rotulo } do status atual

    const li = document.createElement('li');
    li.className = 'tarefa ' + estado.chave; // ex.: "tarefa concluido" (o CSS pinta pela classe)
    li.innerHTML =
      '<button class="marca" aria-label="Mudar status">' + iconeCheck + '</button>' +
      '<span class="texto"><span class="nome"></span><small class="meta"></small></span>' +
      '<button class="selo">' + estado.rotulo + '</button>';

    // Textos digitados pela usuária entram com textContent (e não dentro do innerHTML acima)
    // para que ninguém consiga injetar código HTML pelo formulário.
    li.querySelector('.nome').textContent = tarefa.nome;

    // Linha de detalhes: só aparece se houver prazo e/ou prioridade
    const detalhes = [];
    if (tarefa.prazo)      detalhes.push('Prazo: ' + formatarData(tarefa.prazo));
    if (tarefa.prioridade) detalhes.push('Prioridade ' + tarefa.prioridade);
    li.querySelector('.meta').textContent = detalhes.join(' · ');
    if (tarefa.descricao) li.title = tarefa.descricao; // a descrição aparece ao pousar o mouse

    // Os dois botões da linha (ícone e selo) fazem a mesma coisa ao clicar:
    // avançam para o próximo status. O "% 3" faz voltar ao início depois do último.
    li.querySelectorAll('button').forEach(function (botao) {
      botao.onclick = function () {
        tarefa.estado = (tarefa.estado + 1) % ESTADOS.length;
        salvarTarefas();
        desenhar(); // redesenha para mostrar a mudança
      };
    });

    lista.appendChild(li); // coloca a linha pronta dentro da <ul>
  });

  // 3.4 Atualiza o texto do botão "Ver todas"
  verTodas.textContent = mostrarTodas ? 'Ver menos' : 'Ver todas (' + tarefas.length + ')';

  // 3.5 Calcula o progresso: tarefas concluídas ÷ total × 100
  const concluidas = tarefas.filter(function (t) { return t.estado === 2; }).length;
  const porcentagem = tarefas.length ? Math.round(concluidas / tarefas.length * 100) : 0;

  // 3.6 Atualiza o número e o anel.
  // offset = parte do círculo que fica ESCONDIDA. 100% → 0 (nada escondido).
  pct.textContent = porcentagem + '%';
  valor.style.strokeDashoffset = CIRCUNFERENCIA * (1 - porcentagem / 100);
  document.getElementById('anel').setAttribute('aria-label', porcentagem + '% concluído'); // leitores de tela
}


/* ---------- 4. EVENTOS ---------- */

// Botão "Ver todas / Ver menos": inverte o valor (true ↔ false) e redesenha
verTodas.onclick = function () {
  mostrarTodas = !mostrarTodas;
  desenhar();
};

/* ---------- 5. INÍCIO ----------
   Desenha a tela pela primeira vez, assim que a página carrega. */
desenhar();