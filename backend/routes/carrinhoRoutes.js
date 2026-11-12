import { Router } from 'express';
import { CarrinhoController } from '../controllers/carrinhoController.js';
import { validarParamId } from '../middlewares/validacaoMiddleware.js';

const router = Router();

router.post('/', CarrinhoController.adicionar);
router.get('/:id_cliente', validarParamId('id_cliente'), CarrinhoController.listarPorCliente);
router.put('/:id_carrinho', validarParamId('id_carrinho'), CarrinhoController.atualizarQuantidade);
router.delete('/:id_carrinho', validarParamId('id_carrinho'), CarrinhoController.remover);

export default router;