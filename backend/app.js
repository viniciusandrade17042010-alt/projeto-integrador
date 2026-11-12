import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/tratarErro.js';

const app = express();
const PORTA = 3000;

app.use(express.json());
app.use(cors());

// Registro centralizado de todas as rotas (/cliente, /produto, /carrinho)
app.use('/', routes);

// Tratamento de rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ message: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
});

// Middleware global de erros
app.use(errorHandler);

app.listen(PORTA, () => {
  console.log(`Servidor está funcionando em http://localhost:${PORTA} ^.^`);
});

export default app;