import { Router } from 'express';
import { ProdutoController } from '../controllers/produtoController.js';
import { validarParamId } from '../middlewares/validacaoMiddleware.js';

const router = Router();

router.post('/', ProdutoController.cadastrar);
router.get('/', ProdutoController.listar);
router.get('/:id', validarParamId('id'), ProdutoController.buscarPorId);
router.put('/:id', validarParamId('id'), ProdutoController.atualizar);
router.delete('/:id', validarParamId('id'), ProdutoController.deletar);
export default router;