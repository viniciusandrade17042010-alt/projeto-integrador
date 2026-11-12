import { ProdutoModel } from '../models/produtoModel.js';

export const ProdutoController = {
  async cadastrar(req, res, next) {
    try {
      const { nome_produto, categoria, preco, estoque, caminho_imagem } = req.body;

      if (!nome_produto || !categoria || preco === undefined || estoque === undefined) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatórios do produto.' });
      }

      const id_produto = await ProdutoModel.criar({ nome_produto, categoria, preco, estoque, caminho_imagem });

      return res.status(201).json({
        id_produto,
        message: 'Produto cadastrado com sucesso!'
      });
    } catch (error) {
      error.customMessage = 'Erro ao cadastrar produto';
      next(error);
    }
  },

  async listar(req, res, next) {
    try {
      const produtos = await ProdutoModel.listarTodos();
      return res.json(produtos);
    } catch (error) {
      error.customMessage = 'Erro ao buscar produtos';
      next(error);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const produto = await ProdutoModel.buscarPorId(id);

      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      return res.status(200).json(produto);
    } catch (error) {
      error.customMessage = 'Erro ao buscar produto';
      next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { nome_produto, categoria, preco, estoque } = req.body;

      const atualizado = await ProdutoModel.atualizar(id, { nome_produto, categoria, preco, estoque, caminho_imagem });

      if (atualizado) {
        return res.json({ message: 'Produto atualizado com sucesso!' });
      }
      return res.status(404).json({ message: 'Produto não encontrado.' });
    } catch (error) {
      error.customMessage = 'Erro ao atualizar produto';
      next(error);
    }
  },

  async deletar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const excluido = await ProdutoModel.deletar(id);

      if (excluido) {
        return res.json({ message: 'Produto excluído com sucesso!' });
      }
      return res.status(404).json({ message: 'Produto não encontrado.' });
    } catch (error) {
      error.customMessage = 'Erro ao excluir produto';
      next(error);
    }
  }
};