import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Creamos la conexión exportada como "db"
export const db = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  // CORRECCIÓN CRÍTICA: Cambiamos DB_PASSWORD por DB_PASS
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});