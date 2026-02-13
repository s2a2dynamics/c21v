import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

// Usamos el modelo estable disponible gemini-pro-latest
export const aiModel = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });
