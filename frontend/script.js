const API_URL = 'http://localhost:3000';
let usuarioLogado = JSON.parse(localStorage.getItem('usuario')) || null;

window.onload = () => {
  atualizarInterfaceUsuario();
  if (usuarioLogado) carregarCarrinho();
};

// --- CARROSSEL ---
let slideAtual = 0;
const slides = document.querySelectorAll('.slide');

function mudarSlide(direcao) {
  slides[slideAtual].classList.remove('ativo');
  slideAtual = (slideAtual + direcao + slides.length) % slides.length;
  slides[slideAtual].classList.add('ativo');
}
setInterval(() => mudarSlide(1), 5000);

// --- LOGIN & CADASTRO ---
function alternarAuth(tipo) {
  document.getElementById('box-login').style.display = tipo === 'login' ? 'block' : 'none';
  document.getElementById('box-cadastro').style.display = tipo === 'cadastro' ? 'block' : 'none';
}

async function fazerCadastro(e) {
  e.preventDefault();
  const payload = {
    nome: document.getElementById('cad-nome').value,
    cpf: document.getElementById('cad-cpf').value,
    email: document.getElementById('cad-email').value,
    telefone: document.getElementById('cad-telefone').value,
    endereco: document.getElementById('cad-endereco').value,
    senha: document.getElementById('cad-senha').value
  };

  const res = await fetch(`${API_URL}/cliente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const dados = await res.json();
  if (res.ok) {
    alert(dados.message || 'Conta criada com sucesso!');
    alternarAuth('login');
  } else {
    alert(dados.erro || dados.message || 'Erro ao cadastrar');
  }
}

async function fazerLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  const res = await fetch(`${API_URL}/cliente/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const dados = await res.json();
  if (res.ok) {
    usuarioLogado = dados.usuario;
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
    atualizarInterfaceUsuario();
    carregarCarrinho();
    fecharModal('modal-auth');
  } else {
    alert(dados.erro || 'E-mail ou senha inválidos!');
  }
}

function logout() {
  usuarioLogado = null;
  localStorage.removeItem('usuario');
  atualizarInterfaceUsuario();
  document.getElementById('contador-carrinho').textContent = '0';
}

function atualizarInterfaceUsuario() {
  const saudacao = document.getElementById('saudacao-usuario');
  const btnAuth = document.getElementById('btn-abrir-auth');
  const btnSair = document.getElementById('btn-sair');

  if (usuarioLogado) {
    saudacao.textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]}`;
    saudacao.style.display = 'inline';
    btnAuth.style.display = 'none';
    btnSair.style.display = 'inline-flex';
  } else {
    saudacao.style.display = 'none';
    btnAuth.style.display = 'inline-flex';
    btnSair.style.display = 'none';
  }
}

// --- CARRINHO COMPLETO (ADICIONAR, ALTERAR, REMOVER, EXCLUIR) ---
async function adicionarAoCarrinho(id_produto) {
  if (!usuarioLogado) {
    alert('Faça login antes de adicionar itens ao carrinho!');
    abrirModal('modal-auth');
    return;
  }

  await fetch(`${API_URL}/carrinho`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_cliente: usuarioLogado.id_cliente, id_produto })
  });

  carregarCarrinho();
}

async function carregarCarrinho() {
  if (!usuarioLogado) return;
  const res = await fetch(`${API_URL}/carrinho/${usuarioLogado.id_cliente}`);
  const itens = await res.json();

  const lista = document.getElementById('lista-carrinho');
  const contador = document.getElementById('contador-carrinho');
  const totalEl = document.getElementById('valor-total');

  lista.innerHTML = '';
  let somaTotal = 0;
  let qtdTotal = 0;

  itens.forEach(item => {
    somaTotal += Number(item.preco) * item.quantidade;
    qtdTotal += item.quantidade;

    const li = document.createElement('li');
    li.className = 'item-carrinho';
    li.innerHTML = `
      <div>
        <strong>${item.nome_produto}</strong><br>
        <small>R$ ${Number(item.preco).toFixed(2).replace('.', ',')} cada</small>
      </div>
      <div class="controles-qtd">
        <button class="btn-qtd" onclick="alterarQuantidade(${item.id_carrinho}, ${item.quantidade - 1})">-</button>
        <span>${item.quantidade}</span>
        <button class="btn-qtd" onclick="alterarQuantidade(${item.id_carrinho}, ${item.quantidade + 1})">+</button>
        <button class="btn-excluir" onclick="excluirItem(${item.id_carrinho})">Excluir</button>
      </div>
    `;
    lista.appendChild(li);
  });

  contador.textContent = qtdTotal;
  totalEl.textContent = somaTotal.toFixed(2).replace('.', ',');
}

async function alterarQuantidade(id_carrinho, novaQtd) {
  await fetch(`${API_URL}/carrinho/${id_carrinho}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantidade: novaQtd })
  });
  carregarCarrinho();
}

async function excluirItem(id_carrinho) {
  await fetch(`${API_URL}/carrinho/${id_carrinho}`, { method: 'DELETE' });
  carregarCarrinho();
}

function abrirCarrinho() {
  if (!usuarioLogado) {
    alert('Faça login para acessar seu carrinho!');
    abrirModal('modal-auth');
    return;
  }
  carregarCarrinho();
  abrirModal('modal-carrinho');
}

// --- FILTROS E BUSCA ---
function filtrarCategoria(categoria, botao) {
  document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('ativo'));
  botao.classList.add('ativo');

  document.querySelectorAll('.card').forEach(card => {
    card.style.display = (categoria === 'Todos' || card.dataset.categoria === categoria) ? 'flex' : 'none';
  });
}

document.getElementById('busca').addEventListener('input', function() {
  const termo = this.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const titulo = card.querySelector('h2').textContent.toLowerCase();
    card.style.display = titulo.includes(termo) ? 'flex' : 'none';
  });
});

function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function fecharModal(id) { document.getElementById(id).style.display = 'none'; }