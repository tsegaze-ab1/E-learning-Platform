import fs from 'node:fs';
import adminSdk from 'firebase-admin';

import { env } from './env.js';

function normalizePrivateKey(serviceAccount) {
  if (!serviceAccount || typeof serviceAccount !== 'object') return serviceAccount;

  if (typeof serviceAccount.private_key === 'string') {
    // Common .env pitfall: private_key newlines become \n
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
}

function tryParseServiceAccountJson(json) {
  if (!json) return undefined;

  try {
    return normalizePrivateKey(JSON.parse(json));
  } catch {
    return undefined;
  }
}

function loadServiceAccountFromPath(path) {
  if (!path) return undefined;

  try {
    const raw = fs.readFileSync(path, 'utf8');
    return normalizePrivateKey(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

export function isFirebaseAdminConfigured() {
  return Boolean(
    env.firebaseServiceAccountPath || env.firebaseServiceAccountJson || process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
}

export function initializeFirebaseAdmin() {
  // Prevent "The default Firebase app already exists" errors.
  if (adminSdk.apps.length > 0) return adminSdk;

  const serviceAccount =
    loadServiceAccountFromPath(env.firebaseServiceAccountPath) ??
    tryParseServiceAccountJson(env.firebaseServiceAccountJson);

  if (serviceAccount) {
    adminSdk.initializeApp({
      credential: adminSdk.credential.cert(serviceAccount),
    });
    return adminSdk;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    adminSdk.initializeApp({
      credential: adminSdk.credential.applicationDefault(),
      projectId: env.firebaseProjectId,
    });
    return adminSdk;
  }

  // Not configured; return uninitialized SDK. Callers should guard with isFirebaseAdminConfigured().
  return adminSdk;
}

// Exports required by project.
export const admin = initializeFirebaseAdmin();

export const auth = isFirebaseAdminConfigured() && admin.apps.length > 0 ? admin.auth() : null;
export const firestore = isFirebaseAdminConfigured() && admin.apps.length > 0 ? admin.firestore() : null;
