const CHAVE_TAREFAS = 'destrava-tarefas';
const formAcao = document.getElementById('formAcao');

formAcao.addEventListener('submit', function (evento) {
  evento.preventDefault();

  let tarefas = [];
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_TAREFAS));
    if (Array.isArray(salvas)) tarefas = salvas;
  } catch (erro) {
    tarefas = [];
  }

  const prioridades = { alta: 'alta', media: 'média', baixa: 'baixa' };
  tarefas.push({
    nome: document.getElementById('titulo').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    prazo: document.getElementById('prazo').value,
    prioridade: prioridades[document.getElementById('prioridade').value],
    estado: 0
  });

  localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
  window.location.href = 'home.html';
});