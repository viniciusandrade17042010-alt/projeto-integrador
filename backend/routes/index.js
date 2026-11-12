import { Router } from 'express';
import clienteRoutes from './clienteRoutes.js';
import produtoRoutes from './produtoRoutes.js';
import carrinhoRoutes from './carrinhoRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ mensagem: 'Programa rodando certinho!' });
});

router.use('/cliente', clienteRoutes);
router.use('/produto', produtoRoutes);
router.use('/carrinho', carrinhoRoutes);

export default router;