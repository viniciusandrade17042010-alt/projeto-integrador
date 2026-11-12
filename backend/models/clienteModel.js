import conexao from '../config/db.js'; // Ajuste para '../db.js' se mantiver na raiz

export const ClienteModel = {
  async criar({ nome, cpf, email, telefone, endereco }) {
    const sql = 'INSERT INTO cliente (nome, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?);';
    const [resposta] = await conexao.query(sql, [nome, cpf, email, telefone, endereco]);
    return resposta.insertId;
  },

  async listarTodos() {
    const sql = 'SELECT * FROM cliente';
    const [resposta] = await conexao.query(sql);
    return resposta;
  },

  async buscarPorId(id) {
    const sql = 'SELECT * FROM cliente WHERE id_cliente = ?';
    const [resultado] = await conexao.query(sql, [id]);
    return resultado[0];
  },

  async atualizar(id, { nome, cpf, email, telefone, endereco }) {
    const sql = 'UPDATE cliente SET nome=?, cpf=?, email=?, telefone=?, endereco=? WHERE id_cliente=?';
    const [resposta] = await conexao.query(sql, [nome, cpf, email, telefone, endereco, id]);
    return resposta.affectedRows > 0;
  },

  async deletar(id) {
    const sql = 'DELETE FROM cliente WHERE id_cliente = ?';
    const [resposta] = await conexao.query(sql, [id]);
    return resposta.affectedRows > 0;
  }
};