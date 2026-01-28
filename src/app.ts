import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getPropertiesHTML, chatWithGemini } from './controllers/property.controller';

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); // Vital para entender los mensajes del chat
// Desactivamos CSP de Helmet para que permita ejecutar los scripts del Chatbot y cargar fotos externas
app.use(helmet({ contentSecurityPolicy: false }));

// RUTAS
app.get('/', getPropertiesHTML);      // La Web para los humanos
app.post('/api/chat', chatWithGemini); // La API para el cerebro IA

// Encender Servidor
app.listen(port, () => {
  console.log(`🚀 Servidor C21 + Gemini listo en puerto ${port}`);
});
