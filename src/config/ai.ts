import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Iniciamos Gemini solo si hay API Key, si no, no explotamos
const apiKey = process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const aiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
