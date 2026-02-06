import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

// Usamos el modelo moderno Flash 2.0 (o similar sugerido)
export const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
