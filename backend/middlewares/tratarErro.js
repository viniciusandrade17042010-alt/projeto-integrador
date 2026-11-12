export const errorHandler = (err, req, res, next) => {
  console.error('[ERRO NO SERVIDOR]:', err);
  const status = err.statusCode || 500;
  const message = err.customMessage || 'Erro interno no servidor';

  return res.status(status).json({
    message,
    error: err.message
  });
};