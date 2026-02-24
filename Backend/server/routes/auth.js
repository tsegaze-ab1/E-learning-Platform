import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const authRouter = Router();

// Test route: verifies token and returns decoded claims.
authRouter.get('/auth/verify', verifyFirebaseToken, (req, res) => {
  res.json({ ok: true, user: req.user });
});
