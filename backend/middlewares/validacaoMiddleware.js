import { isValidId } from '../utils/validacoes.js';

export const validarParamId = (nomeParam = 'id') => {
  return (req, res, next) => {
    const valor = req.params[nomeParam];
    if (!isValidId(valor)) {
      return res.status(400).json({ message: `O parâmetro '${nomeParam}' deve ser um número válido.` });
    }
    next();
  };
};