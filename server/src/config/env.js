import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env relative to server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Parse allowed client origins (supports comma-separated string)
const rawOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const CLIENT_ORIGIN = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const MONGO_URI = process.env.MONGO_URI || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

// Basic startup validation
export const validateEnv = () => {
  const warnings = [];

  if (!process.env.MONGO_URI) {
    warnings.push('MONGO_URI is not set. Database features will operate in disconnected mode.');
  }

  if (NODE_ENV === 'production') {
    if (!process.env.MONGO_URI) {
      throw new Error('FATAL: MONGO_URI must be provided in production environment.');
    }
    if (CLIENT_ORIGIN.includes('*') || CLIENT_ORIGIN.length === 0) {
      throw new Error('FATAL: Wildcard or empty CLIENT_ORIGIN is not permitted in production.');
    }
  }

  return { warnings };
};

export const env = {
  NODE_ENV,
  PORT,
  CLIENT_ORIGIN,
  MONGO_URI,
  GEMINI_API_KEY,
  JWT_SECRET,
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test'
};
