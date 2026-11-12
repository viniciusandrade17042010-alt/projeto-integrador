import { CarrinhoModel } from '../models/carrinhoModel.js';
import { ProdutoModel } from '../models/produtoModel.js';
import { isPositiveNumber } from '../utils/validacoes.js';;

export const CarrinhoController = {
  async adicionar(req, res, next) {
    try {
      const { id_cliente, id_produto, quantidade } = req.body;

      if (!id_cliente || !id_produto || !isPositiveNumber(quantidade)) {
        return res.status(400).json({
          message: 'Dados inválidos. Verifique o cliente, o produto e se a quantidade é maior que zero.'
        });
      }

      // Passo 1: Verificar produto e estoque
      const produto = await ProdutoModel.buscarEstoqueENome(id_produto);
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado!' });
      }

      // Passo 2: Validar estoque inicial
      if (quantidade > produto.estoque) {
        return res.status(400).json({
          message: `Estoque insuficiente para '${produto.nome_produto}'. Disponível: ${produto.estoque}`
        });
      }

      // Passo 3: Verificar duplicidade no carrinho
      const itemAtual = await CarrinhoModel.buscarItemClienteProduto(id_cliente, id_produto);

      if (itemAtual) {
        const novaQuantidade = itemAtual.quantidade + quantidade;

        if (novaQuantidade > produto.estoque) {
          return res.status(400).json({
            message: `Estoque insuficiente! Você já tem ${itemAtual.quantidade} no carrinho e tentou adicionar mais ${quantidade}. Máximo disponível: ${produto.estoque}.`
          });
        }

        await CarrinhoModel.atualizarQuantidade(itemAtual.id_carrinho, novaQuantidade);
        return res.status(200).json({ message: 'Quantidade atualizada no carrinho com sucesso!' });
      }

      // Se não existe, insere novo registro
      const id_carrinho = await CarrinhoModel.adicionarItem(id_cliente, id_produto, quantidade);
      return res.status(201).json({
        id_carrinho,
        message: 'Produto adicionado ao carrinho com sucesso!'
      });
    } catch (error) {
      error.customMessage = 'Erro ao adicionar produto ao carrinho';
      next(error);
    }
  },

  async listarPorCliente(req, res, next) {
    try {
      const { id_cliente } = req.params;
      const itens = await CarrinhoModel.listarPorCliente(id_cliente);
      return res.json(itens);
    } catch (error) {
      error.customMessage = 'Erro ao buscar itens do carrinho';
      next(error);
    }
  },

  async atualizarQuantidade(req, res, next) {
    try {
      const { id_carrinho } = req.params;
      const { quantidade } = req.body;

      if (!isPositiveNumber(quantidade)) {
        return res.status(400).json({ message: 'A quantidade deve ser maior que zero.' });
      }

      // Passo 1: Descobrir o produto do item
      const item = await CarrinhoModel.buscarPorId(id_carrinho);
      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado no carrinho.' });
      }

      // Passo 2: Checar estoque
      const produto = await ProdutoModel.buscarEstoqueENome(item.id_produto);

      // Passo 3: Validar estoque
      if (quantidade > produto.estoque) {
        return res.status(400).json({
          message: `Estoque insuficiente! Apenas ${produto.estoque} unidades disponíveis de '${produto.nome_produto}'.`
        });
      }

      // Passo 4: Atualizar
      const atualizado = await CarrinhoModel.atualizarQuantidade(id_carrinho, quantidade);
      if (atualizado) {
        return res.json({ message: 'Quantidade atualizada com sucesso!' });
      }
      return res.status(404).json({ message: 'Item do carrinho não encontrado.' });
    } catch (error) {
      error.customMessage = 'Erro ao atualizar quantidade';
      next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { id_carrinho } = req.params;
      const removido = await CarrinhoModel.removerItem(id_carrinho);

      if (removido) {
        return res.json({ message: 'Item removido do carrinho com sucesso!' });
      }
      return res.status(404).json({ message: 'Item não encontrado.' });
    } catch (error) {
      error.customMessage = 'Erro ao remover item do carrinho';
      next(error);
    }
  }
};