import conexao from '../config/db.js'; // Ajuste para '../db.js' se mantiver na raiz

export const ClienteModel = {
  async criar({ nome, cpf, email, telefone, endereco, senha }) {
    const sql = 'INSERT INTO cliente (nome, cpf, email, telefone, endereco, senha_hash) VALUES (?, ?, ?, ?, ?, ?)';
    const [resposta] = await conexao.query(sql, [nome, cpf, email, telefone, endereco, senha]);
    return resposta.insertId;
  },

  async autenticar(email, senha) {
    const sql = 'SELECT id_cliente, nome, email FROM cliente WHERE email = ? AND senha_hash = ?';
    const [resultado] = await conexao.query(sql, [email, senha]);
    return resultado[0];
  },

  async listarTodos() {
    const sql = 'SELECT id_cliente, nome, cpf, email, telefone, endereco, data_cadastro FROM cliente';
    const [resposta] = await conexao.query(sql);
    return resposta;
  },

  async buscarPorId(id) {
    const sql = 'SELECT id_cliente, nome, cpf, email, telefone, endereco, data_cadastro FROM cliente WHERE id_cliente = ?';
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