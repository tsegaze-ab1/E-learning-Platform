import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from '../utils/coursesFirestore.js';

export const listCourses = asyncHandler(async (req, res) => {
  const courses = await getAllCourses();
  res.json({ ok: true, courses });
});

export const getCourseDetails = asyncHandler(async (req, res) => {
  const course = await getCourseById(req.params.id);
  res.json({ ok: true, course });
});

export const addCourse = asyncHandler(async (req, res) => {
  const course = await createCourse(req.body);
  res.status(201).json({ ok: true, course });
});

export const editCourse = asyncHandler(async (req, res) => {
  const course = await updateCourse(req.params.id, req.body);
  res.json({ ok: true, course });
});

export const removeCourse = asyncHandler(async (req, res) => {
  await deleteCourse(req.params.id);
  res.json({ ok: true });
});
