import conexao from '../config/db.js';

export const ProdutoModel = {
  async criar({ nome_produto, categoria, preco, estoque, caminho_imagem }) {
    const sql = 'INSERT INTO produto (nome_produto, categoria, preco, estoque, caminho_imagem) VALUES (?, ?, ?, ?);';
    const [resposta] = await conexao.query(sql, [nome_produto, categoria, preco, estoque, caminho_imagem]);
    return resposta.insertId;
  },

  async listarTodos() {
    const sql = 'SELECT * FROM produto';
    const [resposta] = await conexao.query(sql);
    return resposta;
  },

  async buscarPorId(id) {
    const sql = 'SELECT * FROM produto WHERE id_produto = ?';
    const [resultado] = await conexao.query(sql, [id]);
    return resultado[0];
  },

  async buscarEstoqueENome(id_produto) {
    const sql = 'SELECT estoque, nome_produto FROM produto WHERE id_produto = ?';
    const [rows] = await conexao.query(sql, [id_produto]);
    return rows[0];
  },

  async atualizar(id, { nome_produto, categoria, preco, estoque }) {
    const sql = 'UPDATE produto SET nome_produto=?, categoria=?, preco=?, estoque=? WHERE id_produto=? caminho_imagem=?';
    const [resposta] = await conexao.query(sql, [nome_produto, categoria, preco, estoque, id]);
    return resposta.affectedRows > 0;
  },

  async deletar(id) {
    const sql = 'DELETE FROM produto WHERE id_produto = ?';
    const [resposta] = await conexao.query(sql, [id]);
    return resposta.affectedRows > 0;
  }
};