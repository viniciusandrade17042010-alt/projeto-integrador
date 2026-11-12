import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController.js';
import { validarParamId } from '../middlewares/validacaoMiddleware.js';

const router = Router();

router.post('/', ClienteController.cadastrar);
router.get('/', ClienteController.listar);
router.get('/:id', validarParamId('id'), ClienteController.buscarPorId);
router.put('/:id', validarParamId('id'), ClienteController.atualizar);
router.delete('/:id', validarParamId('id'), ClienteController.deletar);

export default router;