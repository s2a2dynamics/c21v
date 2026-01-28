"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const property_controller_1 = require("./controllers/property.controller");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // Vital para entender los mensajes del chat
// Desactivamos CSP de Helmet para que permita ejecutar los scripts del Chatbot y cargar fotos externas
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
// RUTAS
app.get('/', property_controller_1.getPropertiesHTML); // La Web para los humanos
app.post('/api/chat', property_controller_1.chatWithGemini); // La API para el cerebro IA
// Encender Servidor
app.listen(port, () => {
    console.log(`🚀 Servidor C21 + Gemini listo en puerto ${port}`);
});
