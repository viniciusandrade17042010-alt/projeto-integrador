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

app.get("/", async (req, res) =>{
  try {
    res.status(200).json({mensagem: "Programa rodando certinho!"});
  }
  catch (erro){
    console.error(erro);
    res.status(500).json({ message: "Erro no sistema", error: error.message });
  }
});        

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
// 3. ROTAS DO CARRINHO DE COMPRAS (COMPLETAS E CORRIGIDAS)
// ==========================================

// 1. ADICIONAR ITEM AO CARRINHO (Com Validação de Estoque e Prevenção de Duplicidade)
app.post('/carrinho', async (req, res) => {
  try {
    const { id_cliente, id_produto, quantidade } = req.body;

    // Validação básica de entrada para garantir dados corretos
    if (!id_cliente || !id_produto || !quantidade || quantidade <= 0) {
      return res.status(400).json({ message: "Dados inválidos. Verifique o cliente, o produto e se a quantidade é maior que zero." });
    }

    // Passo 1: Verificar no banco se o produto existe e qual é o estoque atual dele
    const [produtoRows] = await conexao.query(
      "SELECT estoque, nome_produto FROM produto WHERE id_produto = ?", 
      [id_produto]
    );

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

    // Passo 3: Verificar se o item JÁ EXISTE no carrinho deste cliente
    const [carrinhoExistente] = await conexao.query(
      "SELECT id_carrinho, quantidade FROM carrinho_de_compra WHERE id_cliente = ? AND id_produto = ?",
      [id_cliente, id_produto]
    );

    if (carrinhoExistente.length > 0) {
      // Se já existe, atualizamos somando a quantidade nova
      const itemAtual = carrinhoExistente[0];
      const novaQuantidade = itemAtual.quantidade + quantidade;

      // Valida se a nova quantidade somada respeita o estoque
      if (novaQuantidade > produto.estoque) {
        return res.status(400).json({ 
          message: `Estoque insuficiente! Você já tem ${itemAtual.quantidade} no carrinho e tentou adicionar mais ${quantidade}. Máximo disponível: ${produto.estoque}.` 
        });
      }

      await conexao.query(
        "UPDATE carrinho_de_compra SET quantidade = ? WHERE id_carrinho = ?",
        [novaQuantidade, itemAtual.id_carrinho]
      );

      return res.status(200).json({ message: "Quantidade atualizada no carrinho com sucesso!" });
    } else {
      // Se não existe, insere um novo registro normalmente
      const sql = "INSERT INTO carrinho_de_compra (id_cliente, id_produto, quantidade) VALUES (?, ?, ?);";
      const [resposta] = await conexao.query(sql, [id_cliente, id_produto, quantidade]);

      return res.status(201).json({
        id_carrinho: resposta.insertId,
        message: "Produto adicionado ao carrinho com sucesso!"
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao adicionar produto ao carrinho", error: error.message });
  }
});

// 2. BUSCAR ITENS DO CARRINHO DE UM CLIENTE (Utilizando INNER JOIN)
app.get('/carrinho/:id_cliente', async (req, res) => {
  try {
    const id_cliente = req.params.id_cliente;
    
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

// 3. ALTERAR QUANTIDADE DE UM ITEM NO CARRINHO (Com Validação de Entrada e Estoque)
('/carrinho/:id_carrinho', async (req, res) => {
  try {
    const id_carrinho = req.params.id_carrinho;
    const { quantidade } = req.body;

    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({ message: "A quantidade deve ser maior que zero." });
    }

    // Passo 1: Descobrir qual é o ID do produto associado a este item do carrinho
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
// 4. ROTAS DE PRODUTOS
// ==========================================

// Rota POST: Cadastrar um novo produto
app.post('/produto', async (req, res) => {
  try {
    const { nome_produto, categoria, preco, estoque } = req.body;

    // Validação básica
    if (!nome_produto || !categoria || preco === undefined || estoque === undefined) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios do produto." });
    }

    const sql = "INSERT INTO produto (nome_produto, categoria, preco, estoque) VALUES (?, ?, ?, ?);";
    const [resposta] = await conexao.query(sql, [nome_produto, categoria, preco, estoque]);

    res.status(201).json({
      id_produto: resposta.insertId,
      message: "Produto cadastrado com sucesso!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar produto", error: error.message });
  }
});

// Rota GET: Listar todos os produtos cadastrados
app.get('/produto', async (req, res) => {
  try {
    const sql = "SELECT * FROM produto";
    const [resposta] = await conexao.query(sql);
    res.json(resposta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar produtos", error: error.message });
  }
});

// Rota GET: Buscar produto específico pelo ID
app.get('/produto/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sql = "SELECT * FROM produto WHERE id_produto = ?";
    
    const [resultado] = await conexao.query(sql, [id]);

    if (resultado.length === 0) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    return res.status(200).json(resultado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar produto", error: error.message });
  }
});

// Rota PUT: Atualizar dados de um produto pelo ID
app.put("/produto/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome_produto, categoria, preco, estoque } = req.body;

    const sql = "UPDATE produto SET nome_produto=?, categoria=?, preco=?, estoque=? WHERE id_produto=?";
    const [resposta] = await conexao.query(sql, [nome_produto, categoria, preco, estoque, id]);

    if (resposta.affectedRows > 0) {
      res.json({ message: "Produto atualizado com sucesso!" });
    } else {
      res.status(404).json({ message: "Produto não encontrado." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar produto", error: error.message });
  }
});

// Rota DELETE: Excluir um produto pelo ID
app.delete("/produto/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sql = "DELETE FROM produto WHERE id_produto = ?";
    
    const [resposta] = await conexao.query(sql, [id]);

    if (resposta.affectedRows > 0) {
      res.json({ message: "Produto excluído com sucesso!" });
    } else {
      res.status(404).json({ message: "Produto não encontrado." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir produto", error: error.message });
  }
});

// ==========================================
// 5. INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(PORTA, () => {
  console.log(`Servidor está funcionando em http://localhost:${PORTA} ^.^`);
});