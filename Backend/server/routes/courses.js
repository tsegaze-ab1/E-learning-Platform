import { Router } from 'express';

import {
	addCourse,
	editCourse,
	getCourseDetails,
	listCourses,
	removeCourse,
} from '../controllers/coursesController.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { requireRole } from '../middleware/requireRole.js';

export const coursesRouter = Router();

// Public
coursesRouter.get('/courses', listCourses);
coursesRouter.get('/courses/:id', getCourseDetails);

// Admin only
const requireAdminRole = requireRole(['admin']);

coursesRouter.post('/courses', verifyFirebaseToken, requireAdminRole, addCourse);
coursesRouter.put('/courses/:id', verifyFirebaseToken, requireAdminRole, editCourse);
coursesRouter.delete('/courses/:id', verifyFirebaseToken, requireAdminRole, removeCourse);
