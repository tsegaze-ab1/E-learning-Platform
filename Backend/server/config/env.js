import dotenv from 'dotenv';

dotenv.config();

function toNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function splitCsv(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const port = toNumber(process.env.PORT, 5000);

const corsOriginsRaw = process.env.CORS_ORIGIN ?? process.env.FRONTEND_URL ?? 'http://localhost:5173';
const corsOrigins = splitCsv(corsOriginsRaw);

export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  corsOrigins: corsOrigins.length ? corsOrigins : ['http://localhost:5173'],

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? undefined,
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? undefined,
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? undefined,
};

if (!Number.isFinite(env.port) || env.port <= 0) {
  throw new Error('Invalid PORT. Set PORT to a positive number.');
}
