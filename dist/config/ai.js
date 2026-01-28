"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiModel = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Iniciamos Gemini solo si hay API Key, si no, no explotamos
const apiKey = process.env.GOOGLE_API_KEY || '';
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
// Usamos el modelo moderno sugerido por Antigravity
exports.aiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
