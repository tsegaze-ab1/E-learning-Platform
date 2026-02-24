import { requireRole } from './requireRole.js';

export const requireAdmin = requireRole(['admin']);
