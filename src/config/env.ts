import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    // Servidor
    PORT: z.string().default('8080'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Base de Datos
    DB_HOST: z.string().min(1, "DB_HOST es obligatoria"),
    DB_USER: z.string().min(1, "DB_USER es obligatoria"),
    DB_PASS: z.string().min(1, "DB_PASS es obligatoria"),
    DB_NAME: z.string().min(1, "DB_NAME es obligatoria"),
    DB_PORT: z.string().transform(Number).default(3306),

    // AI
    GOOGLE_API_KEY: z.string().min(10, "GOOGLE_API_KEY parece demasiado corta o falta"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Error de configuración de entorno:");
    console.error(parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
