import { existsSync } from 'fs';
import { isAbsolute, join, resolve } from 'path';

/**
 * Load backend/.env (if present) before anything reads process.env.
 * Uses Node's built-in loader, so no extra dependency is needed.
 */
const envFile = join(__dirname, '..', '.env');
if (existsSync(envFile)) {
  try {
    (process as unknown as { loadEnvFile?: (p: string) => void }).loadEnvFile?.(envFile);
  } catch {
    /* ignore malformed .env — defaults below still apply */
  }
}

/** backend/ (this file compiles to backend/dist/config.js) */
const BACKEND_ROOT = join(__dirname, '..');

const fromBackend = (p: string) => (isAbsolute(p) ? p : resolve(BACKEND_ROOT, p));

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  databasePath: fromBackend(process.env.DATABASE_PATH || '../database/app.sqlite'),
  uploadDir: fromBackend(process.env.UPLOAD_DIR || './uploads'),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  sessionHours: parseInt(process.env.SESSION_HOURS || '8', 10),
  isProduction: process.env.NODE_ENV === 'production',
  staffSeed: {
    email: (process.env.STAFF_EMAIL || 'admin@lawsondigital.dev').toLowerCase(),
    password: process.env.STAFF_PASSWORD || 'Lawson@2026',
    name: process.env.STAFF_NAME || 'Rhett Lawson',
  },
  cookieName: 'lds_staff',
};
