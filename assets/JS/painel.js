
const ESTADOS = [
  { chave: 'pendente',  rotulo: 'Pendente' },     
  { chave: 'andamento', rotulo: 'Em andamento' }, 
  { chave: 'concluido', rotulo: 'Concluído' }    
];


const TAREFAS_INICIAIS = [
  { nome: 'Estudar lógica de programação',      estado: 2 },
  { nome: 'Aprender Python',                    estado: 1 },
  { nome: 'Criar projeto de análise de dados',  estado: 0 },
  { nome: 'Revisar estatística básica',         estado: 2 },
  { nome: 'Praticar consultas em SQL',          estado: 0 }
];
const CHAVE_TAREFAS = window.Destrava.chave('tarefas');

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


let mostrarTodas = false;
const LIMITE = 3; 

const CIRCUNFERENCIA = 2 * Math.PI * 48;



const lista    = document.getElementById('lista');    
const valor    = document.getElementById('valor');    
const pct      = document.getElementById('pct');      
const verTodas = document.getElementById('verTodas'); 


valor.style.strokeDasharray = CIRCUNFERENCIA;

// Desenho do ícone (círculo com check) que aparece em cada tarefa
const iconeCheck =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">' +
  '<circle cx="8" cy="8" r="6.5"/>' +
  '<path d="M5.2 8.2l2 2 3.6-4" stroke-linecap="round" stroke-linejoin="round"/></svg>';



function formatarData(iso) {
  const partes = iso.split('-'); 
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}



function desenhar() {


  const visiveis = mostrarTodas ? tarefas : tarefas.slice(0, LIMITE);

  // 3.2 Limpa a lista antes de recriar
  lista.innerHTML = '';


  visiveis.forEach(function (tarefa) {
    const estado = ESTADOS[tarefa.estado]; 

    const li = document.createElement('li');
    li.className = 'tarefa ' + estado.chave; 
    li.innerHTML =
      '<button class="marca" aria-label="Mudar status">' + iconeCheck + '</button>' +
      '<span class="texto"><span class="nome"></span><small class="meta"></small></span>' +
      '<button class="selo">' + estado.rotulo + '</button>';


    li.querySelector('.nome').textContent = tarefa.nome;

  
    const detalhes = [];
    if (tarefa.prazo)      detalhes.push('Prazo: ' + formatarData(tarefa.prazo));
    if (tarefa.prioridade) detalhes.push('Prioridade ' + tarefa.prioridade);
    li.querySelector('.meta').textContent = detalhes.join(' · ');
    if (tarefa.descricao) li.title = tarefa.descricao; // a descrição aparece ao pousar o mouse


    li.querySelectorAll('button').forEach(function (botao) {
      botao.onclick = function () {
        tarefa.estado = (tarefa.estado + 1) % ESTADOS.length;
        salvarTarefas();
        desenhar(); 
      };
    });

    lista.appendChild(li);
  });


  verTodas.textContent = mostrarTodas ? 'Ver menos' : 'Ver todas (' + tarefas.length + ')';


  const concluidas = tarefas.filter(function (t) { return t.estado === 2; }).length;
  const porcentagem = tarefas.length ? Math.round(concluidas / tarefas.length * 100) : 0;


  pct.textContent = porcentagem + '%';
  valor.style.strokeDashoffset = CIRCUNFERENCIA * (1 - porcentagem / 100);
  document.getElementById('anel').setAttribute('aria-label', porcentagem + '% concluído'); 
}


verTodas.onclick = function () {
  mostrarTodas = !mostrarTodas;
  desenhar();
};

window.addEventListener('storage', function (evento) {
  if (evento.key !== CHAVE_TAREFAS) return;

  try {
    const salvas = JSON.parse(evento.newValue);
    if (!Array.isArray(salvas)) return;
    tarefas.splice(0, tarefas.length, ...salvas);
    desenhar();
  } catch (erro) {
    console.error('Não foi possível atualizar as tarefas compartilhadas.', erro);
  }
});


desenhar();