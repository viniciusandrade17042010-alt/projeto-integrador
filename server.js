// ==========================================
// 1. IMPORTAÇÕES E CONFIGURAÇÕES DO SERVIDOR
// ==========================================
import express from 'express';
import cors from 'cors';
import conexao from './db.js'; // Importando a conexão com o banco de dados (Pool MariaDB)

const app = express();
app.use(express.json()); // Permite que a API receba e envie dados em formato JSON
app.use(cors()); // Habilita o CORS para permitir a comunicação com o Front-end

const PORTA = 3000; // Definição da porta onde o servidor vai rodar


// ==========================================
// 2. ROTAS DE CLIENTES
// ==========================================

// Rota POST: Cadastrar um novo cliente no banco
app.post('/cliente', async (req, res) => {
  try {
    // Extrai os dados enviados pelo corpo da requisição (body)
    const {  nome, cpf, email, telefone, endereco } = req.body;

    // Comando SQL para inserir o cliente
    const sql = "INSERT INTO cliente ( nome, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?);";
    const [resposta] = await conexao.query(sql, [ nome, cpf, email, telefone, endereco]);

    // Resposta de sucesso enviada para quem chamou a API
    res.status(200).json({
      id: resposta.insertId,
      message: "Cliente cadastrado com sucesso!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar cliente", error: error.message });
  }
});

// Rota GET: Buscar/Listar todos os clientes cadastrados
app.get('/cliente', async (req, res) => {
  try {
    const sql = "SELECT * FROM cliente";
    const [resposta] = await conexao.query(sql);
    res.json(resposta); // Retorna a lista de clientes em formato JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar clientes" });
  }
});

// Rota GET: Buscar cliente específico pelo ID
app.get('/cliente/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sql = "SELECT * FROM cliente WHERE id_cliente = ?";
    
    const [resultado] = await conexao.query(sql, [id]);

    // Se o array estiver vazio, o cliente não existe
    if (resultado.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado..." });
    }

    // Retorna o primeiro item encontrado
    return res.status(200).json(resultado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar cliente", error: error.message });
  }
});

// Rota PUT: Atualizar os dados de um cliente específico pelo ID
app.put("/cliente/:id", async (req, res) => {
  try {
    const id = Number(req.params.id); // Pega o ID da URL
    const { nome, cpf, email, telefone, endereco } = req.body; // Pega os novos dados

    const novoCliente = [nome, cpf, email, telefone, endereco, id];

    const sql = "UPDATE cliente SET nome=?, cpf=?, email=?, telefone=?, endereco=? WHERE id_cliente=?";
    const [resposta] = await conexao.query(sql, novoCliente);

    // Verifica se realmente alterou algum registro
    if (resposta.affectedRows > 0) {
      res.json({ message: "Cliente atualizado com sucesso!" });
    } else {
      res.status(404).json({ message: "Cliente não encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar cliente", error: error.message });
  }
});

// Rota DELETE: Excluir um cliente pelo ID
app.delete("/cliente/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sql = "DELETE FROM cliente WHERE id_cliente = ?";
    
    const [resposta] = await conexao.query(sql, [id]);

    if (resposta.affectedRows > 0) {
      res.json({ message: "Cliente excluído com sucesso!" });
    } else {
      res.status(404).json({ message: "Cliente não encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir cliente", error: error.message });
  }
});

// ==========================================
// 3. ROTAS DE CADASTRO
// ==========================================

// Rota POST: Realizar o registro complementar de cadastro vinculado ao cliente
app.post('/cadastro', async (req, res) => {
  try {
    const { id_cliente, id_cadastro, data_criacao } = req.body;

    const sql = "INSERT INTO cadastro (id_cliente, id_cadastro, data_criacao) VALUES (?, ?, ?);";
    const [resposta] = await conexao.query(sql, [id_cliente, id_cadastro, data_criacao]);

    res.status(200).json({
        id: resposta.insertId,
        message: "Cadastro realizado!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao realizar cadastro", error: error.message });
  }
});


// ==========================================
// 4. ROTAS DO CARRINHO DE COMPRAS (SPRINT 6)
// ==========================================

// 1. ADICIONAR ITEM AO CARRINHO (Com Validação de Estoque)
app.post('/carrinho', async (req, res) => {
  try {
    const { id_cliente, id_produto, quantidade } = req.body;

    // Passo 1: Verificar no banco se o produto existe e qual é o estoque atual dele
    const [produtoRows] = await conexao.query(
      "SELECT estoque, nome_produto FROM produto WHERE id_produto = ?", 
      [id_produto]
    );

    // Se não encontrar o produto, retorna erro 404
    if (produtoRows.length === 0) {
      return res.status(404).json({ message: "Produto não encontrado!" });
    }

    const produto = produtoRows[0];

    // Passo 2: Validar se a quantidade pedida é maior do que tem no estoque
    if (quantidade > produto.estoque) {
      return res.status(400).json({ 
        message: `Estoque insuficiente para '${produto.nome_produto}'. Disponível: ${produto.estoque}` 
      });
    }

    // Passo 3: Se passou na validação, insere o produto na tabela carrinho_de_compra
    const sql = "INSERT INTO carrinho_de_compra (id_cliente, id_produto, quantidade) VALUES (?, ?, ?);";
    const [resposta] = await conexao.query(sql, [id_cliente, id_produto, quantidade]);

    res.status(201).json({
      id_carrinho: resposta.insertId,
      message: "Produto adicionado ao carrinho com sucesso!"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao adicionar produto ao carrinho", error: error.message });
  }
});

// 2. BUSCAR ITENS DO CARRINHO DE UM CLIENTE (Utilizando INNER JOIN para unir dados do produto)
app.get('/carrinho/:id_cliente', async (req, res) => {
  try {
    const id_cliente = req.params.id_cliente;
    
    // Consulta com INNER JOIN para puxar nome, preço e calcular o subtotal multiplicando quantidade x preço
    const sql = `
      SELECT c.id_carrinho, c.quantidade, p.id_produto, p.nome_produto, p.preco, p.estoque, 
             (c.quantidade * p.preco) AS subtotal
      FROM carrinho_de_compra c
      INNER JOIN produto p ON c.id_produto = p.id_produto
      WHERE c.id_cliente = ?
    `;

    const [resposta] = await conexao.query(sql, [id_cliente]);
    res.json(resposta);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar itens do carrinho", error: error.message });
  }
});

// 3. ALTERAR QUANTIDADE DE UM ITEM NO CARRINHO (Com Validação de Estoque)
app.put('/carrinho/:id_carrinho', async (req, res) => {
  try {
    const id_carrinho = req.params.id_carrinho;
    const { quantidade } = req.body;

    // Passo 1: Descobrir qual é o ID do produto que está associado a este item do carrinho
    const [itemRows] = await conexao.query(
      "SELECT id_produto FROM carrinho_de_compra WHERE id_carrinho = ?", 
      [id_carrinho]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({ message: "Item não encontrado no carrinho." });
    }

    const id_produto = itemRows[0].id_produto;

    // Passo 2: Checar o estoque atualizado desse produto na tabela produto
    const [prodRows] = await conexao.query(
      "SELECT estoque, nome_produto FROM produto WHERE id_produto = ?", 
      [id_produto]
    );

    const produto = prodRows[0];

    // Passo 3: Validar se a nova quantidade ultrapassa o estoque disponível
    if (quantidade > produto.estoque) {
      return res.status(400).json({ 
        message: `Estoque insuficiente! Apenas ${produto.estoque} unidades disponíveis de '${produto.nome_produto}'.` 
      });
    }

    // Passo 4: Atualizar a quantidade na tabela carrinho_de_compra
    const sql = "UPDATE carrinho_de_compra SET quantidade = ? WHERE id_carrinho = ?";
    const [resposta] = await conexao.query(sql, [quantidade, id_carrinho]);

    if (resposta.affectedRows > 0) {
      res.json({ message: "Quantidade atualizada com sucesso!" });
    } else {
      res.status(404).json({ message: "Item do carrinho não encontrado." });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar quantidade", error: error.message });
  }
});

// 4. REMOVER/EXCLUIR UM ITEM DO CARRINHO
app.delete('/carrinho/:id_carrinho', async (req, res) => {
  try {
    const id_carrinho = req.params.id_carrinho;

    // Comando SQL para deletar o registro do carrinho com base no ID
    const sql = "DELETE FROM carrinho_de_compra WHERE id_carrinho = ?";
    const [resposta] = await conexao.query(sql, [id_carrinho]);

    if (resposta.affectedRows > 0) {
      res.json({ message: "Item removido do carrinho com sucesso!" });
    } else {
      res.status(404).json({ message: "Item não encontrado." });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao remover item do carrinho", error: error.message });
  }
});


// ==========================================
// 5. INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(PORTA, () => {
  console.log(`Servidor está funcionando em http://localhost:${PORTA} ^.^`);
});
