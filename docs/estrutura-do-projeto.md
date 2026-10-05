# Guia rápido dos arquivos

O Destrava+ é uma aplicação web feita com HTML, CSS e JavaScript. Os dados de contas, tarefas e competências são guardados no `localStorage` do navegador; não há conexão com um servidor ou banco de dados.

## Ponto de entrada

- `index.html`: tela de login e porta de entrada do projeto. Carrega os utilitários de autenticação e o script de login.

## Páginas (`pages/`)

- `painel.html`: painel com tarefas prioritárias e progresso geral das tarefas.
- `inicio.html`: página de apresentação da plataforma, com cursos, oportunidades e resumo de progresso.
- `carreira.html`: objetivo profissional e lista de competências. Permite alterar o status das competências; o formulário de objetivo ainda não tem salvamento implementado.
- `progresso.html`: resumo de tarefas concluídas, em andamento e pendentes, além do histórico de atividades.
- `nova-acao.html`: formulário para cadastrar uma tarefa com descrição, prazo e prioridade.
- `cadastro.html`: formulário de criação de conta pessoal.
- `cadastro-empresas.html`: formulário de cadastro de empresa.
- `inicio-empresas.html`: apresentação do portal voltado a empresas.
- `recuperar-senha.html`: interface de recuperação de senha; o envio de recuperação ainda não está implementado.
- `termos-de-servico.html`: página com os termos de uso.

## Estilos (`assets/CSS/`)

- `tokens.css`: origem central dos tokens CSS, como cores, sombras e fonte compartilhada.
- `header.css`: estilo do cabeçalho e da navegação compartilhados por algumas páginas internas.
- `cadastro-e-login.css`: estilos das telas de login, cadastro, recuperação de senha e termos.
- `painel.css`: estilos do painel e do formulário de nova ação.
- `inicio.css`: estilos da página de apresentação, cursos, oportunidades e progresso.
- `carreira.css`: estilos da página de carreira e das competências.
- `Progresso.css`: estilos da página de resumo do progresso.

As páginas devem carregar `tokens.css` antes da folha de estilo específica para que os tokens estejam disponíveis.

## JavaScript (`assets/JS/`)

- `auth-utils.js`: funções compartilhadas de autenticação. Lê contas, valida e-mails, gera hashes de senha com PBKDF2, cria a sessão e migra dados antigos do navegador.
- `login.js`: valida as credenciais, confere a senha, salva a preferência de lembrar e inicia a sessão.
- `cadastro.js`: valida os formulários pessoal e empresarial, evita e-mails duplicados, cria a conta com senha protegida e inicia a sessão.
- `app.js`: carrega os dados da sessão, prepara chaves de armazenamento por usuário, personaliza o nome e o avatar no cabeçalho e encerra a sessão ao clicar no perfil.
- `painel.js`: carrega e desenha as tarefas do painel, permite avançar seu status, alterna entre lista resumida e completa e recalcula o anel de progresso.
- `inicio.js`: controla os carrosséis de cursos e oportunidades da página inicial pelas setas; nos celulares, os cards também podem ser percorridos com gestos horizontais.
- `acao.js`: salva uma nova tarefa no `localStorage` e retorna ao painel.
- `script.js`: atualiza o resumo da página de progresso e salva/atualiza o status das competências na página de carreira.

Nas páginas que usam mais de um script, `app.js` deve ser carregado antes do script da funcionalidade, pois os demais utilizam os dados e as chaves de usuário preparados por ele.

## Outros arquivos

- `assets/img/logo.png`: imagem da marca usada nas páginas.
- `docs/README.md`: apresentação do projeto, tecnologias e instruções básicas para abrir a aplicação.
- `docs/requisitos.md`: arquivo destinado aos requisitos do projeto.
- `docs/backlog.md`: arquivo destinado à lista de tarefas de desenvolvimento.
- `.vscode/launch.json`: configurações para abrir ou anexar o depurador do VS Code ao navegador.

## Como abrir

Abra `index.html` no navegador. Para usar as funções de cadastro e login com geração de hash, execute o projeto em `localhost` ou HTTPS, pois elas dependem das APIs criptográficas seguras do navegador.
