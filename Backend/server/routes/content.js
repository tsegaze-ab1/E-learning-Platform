import { Router } from 'express';
import multer from 'multer';

import {
  addContent,
  editContent,
  getContentDetails,
  listContent,
  removeContent,
  uploadContentFile,
} from '../controllers/contentController.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { requireRole } from '../middleware/requireRole.js';

const upload = multer({ storage: multer.memoryStorage() });

export const contentRouter = Router();

contentRouter.get('/content', listContent);
contentRouter.get('/content/:id', getContentDetails);

const requireAdminRole = requireRole(['admin']);

contentRouter.post('/content', verifyFirebaseToken, requireAdminRole, addContent);
contentRouter.put('/content/:id', verifyFirebaseToken, requireAdminRole, editContent);
contentRouter.delete('/content/:id', verifyFirebaseToken, requireAdminRole, removeContent);

contentRouter.post(
  '/content/upload',
  verifyFirebaseToken,
  requireAdminRole,
  upload.single('file'),
  uploadContentFile,
);
