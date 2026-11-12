import { ClienteModel } from '../models/clienteModel.js';

export const ClienteController = {
  async cadastrar(req, res, next) {
    try {
      const { nome, cpf, email, telefone, endereco } = req.body;
      const id = await ClienteModel.criar({ nome, cpf, email, telefone, endereco });

      return res.status(200).json({
        id,
        message: 'Cliente cadastrado com sucesso!'
      });
    } catch (error) {
      error.customMessage = 'Erro ao cadastrar cliente';
      next(error);
    }
  },

  async listar(req, res, next) {
    try {
      const clientes = await ClienteModel.listarTodos();
      return res.json(clientes);
    } catch (error) {
      error.customMessage = 'Erro ao buscar clientes';
      next(error);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const cliente = await ClienteModel.buscarPorId(id);

      if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado...' });
      }

      return res.status(200).json(cliente);
    } catch (error) {
      error.customMessage = 'Erro ao buscar cliente';
      next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { nome, cpf, email, telefone, endereco } = req.body;

      const atualizado = await ClienteModel.atualizar(id, { nome, cpf, email, telefone, endereco });

      if (atualizado) {
        return res.json({ message: 'Cliente atualizado com sucesso!' });
      }
      return res.status(404).json({ message: 'Cliente não encontrado' });
    } catch (error) {
      error.customMessage = 'Erro ao atualizar cliente';
      next(error);
    }
  },

  async deletar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const excluido = await ClienteModel.deletar(id);

      if (excluido) {
        return res.json({ message: 'Cliente excluído com sucesso!' });
      }
      return res.status(404).json({ message: 'Cliente não encontrado' });
    } catch (error) {
      error.customMessage = 'Erro ao excluir cliente';
      next(error);
    }
  }
};