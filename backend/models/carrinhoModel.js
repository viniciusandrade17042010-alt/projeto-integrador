import conexao from '../config/db.js';

export const CarrinhoModel = {
  async buscarItemClienteProduto(id_cliente, id_produto) {
    const sql = 'SELECT id_carrinho, quantidade FROM carrinho_de_compra WHERE id_cliente = ? AND id_produto = ?';
    const [rows] = await conexao.query(sql, [id_cliente, id_produto]);
    return rows[0];
  },

  async buscarPorId(id_carrinho) {
    const sql = 'SELECT id_produto FROM carrinho_de_compra WHERE id_carrinho = ?';
    const [rows] = await conexao.query(sql, [id_carrinho]);
    return rows[0];
  },

  async adicionarItem(id_cliente, id_produto, quantidade) {
    const sql = 'INSERT INTO carrinho_de_compra (id_cliente, id_produto, quantidade) VALUES (?, ?, ?);';
    const [resposta] = await conexao.query(sql, [id_cliente, id_produto, quantidade]);
    return resposta.insertId;
  },

  async atualizarQuantidade(id_carrinho, quantidade) {
    const sql = 'UPDATE carrinho_de_compra SET quantidade = ? WHERE id_carrinho = ?';
    const [resposta] = await conexao.query(sql, [quantidade, id_carrinho]);
    return resposta.affectedRows > 0;
  },

  async listarPorCliente(id_cliente) {
    const sql = `
      SELECT c.id_carrinho, c.quantidade, p.id_produto, p.nome_produto, p.preco, p.estoque, 
             (c.quantidade * p.preco) AS subtotal
      FROM carrinho_de_compra c
      INNER JOIN produto p ON c.id_produto = p.id_produto
      WHERE c.id_cliente = ?
    `;
    const [resposta] = await conexao.query(sql, [id_cliente]);
    return resposta;
  },

  async removerItem(id_carrinho) {
    const sql = 'DELETE FROM carrinho_de_compra WHERE id_carrinho = ?';
    const [resposta] = await conexao.query(sql, [id_carrinho]);
    return resposta.affectedRows > 0;
  }
};