import { auth, firestore, isFirebaseAdminConfigured } from '../config/firebase.js';
import { env } from '../config/env.js';

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return undefined;

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return undefined;

  return token;
}

export async function verifyFirebaseToken(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      res.setHeader('WWW-Authenticate', 'Bearer');
      return res.status(401).json({
        ok: false,
        error: {
          message: 'Missing Authorization Bearer token',
          status: 401,
        },
      });
    }

    if (!isFirebaseAdminConfigured() || !auth) {
      return res.status(500).json({
        ok: false,
        error: {
          message: env.isProd
            ? 'Authentication is not configured.'
            : 'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS).',
          status: 500,
        },
      });
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;

    // Fetch user role from Firestore if available
    if (firestore) {
      try {
        const userDoc = await firestore.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          req.user.role = userDoc.data().role;
        }
      } catch (err) {
        console.error('Failed to fetch user role from Firestore:', err);
      }
    }

    return next();
  } catch {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return res.status(401).json({
      ok: false,
      error: {
        message: 'Invalid or expired token',
        status: 401,
      },
    });
  }
}
