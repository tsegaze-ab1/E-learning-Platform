import { admin, firestore as db } from '../config/firebase.js';
import { createHttpError } from './httpError.js';

/**
 * Firestore collection: `courses`
 *
 * Course document schema:
 * - title (string)
 * - description (string)
 * - thumbnailUrl (string)
 * - youtubeUrl (string)
 * - audioUrl (string)
 * - createdAt (timestamp)
 */

const COLLECTION = 'courses';
const REQUIRED_FIELDS = ['title', 'description', 'weekNumber'];
const OPTIONAL_STRING_FIELDS = ['thumbnailUrl', 'youtubeUrl', 'audioUrl', 'pdfUrl'];

function ensureDb() {
  if (!db) {
    throw createHttpError(
      500,
      'Firestore is not configured. Configure Firebase Admin credentials (service account) before using course utilities.',
    );
  }
  return db;
}

function normalizeString(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeWeekNumber(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) return undefined;
  if (n < 1 || n > 10) return undefined;
  return n;
}

function pickAllowedFields(input, { partial }) {
  const body = input ?? {};
  const out = {};

  for (const key of REQUIRED_FIELDS) {
    if (!(key in body)) {
      if (!partial) {
        throw createHttpError(400, `Missing required field: ${key}`);
      }
      continue;
    }

    if (key === 'weekNumber') {
      const weekNumber = normalizeWeekNumber(body[key]);
      if (!weekNumber) {
        throw createHttpError(400, 'Invalid weekNumber: must be an integer between 1 and 10');
      }
      out.weekNumber = weekNumber;
      continue;
    }

    const requiredText = normalizeString(body[key]);
    if (!requiredText) {
      throw createHttpError(400, `Invalid ${key}: must be a non-empty string`);
    }
    out[key] = requiredText;
  }

  for (const key of OPTIONAL_STRING_FIELDS) {
    if (!(key in body)) continue;
    const value = body[key];
    if (value === null || value === undefined || value === '') {
      out[key] = '';
      continue;
    }

    const optionalText = normalizeString(value);
    if (!optionalText) {
      throw createHttpError(400, `Invalid ${key}: must be a string`);
    }
    out[key] = optionalText;
  }

  return out;
}

function withId(snapshot) {
  if (!snapshot?.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

function coursesCollection() {
  return ensureDb().collection(COLLECTION);
}

export async function createCourse(payload) {
  const data = pickAllowedFields(payload, { partial: false });

  const doc = {
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await coursesCollection().add(doc);
  const snap = await ref.get();
  return withId(snap);
}

export async function getAllCourses() {
  const snap = await coursesCollection().orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCourseById(courseId) {
  const id = normalizeString(courseId);
  if (!id) throw createHttpError(400, 'Invalid courseId');

  const snap = await coursesCollection().doc(id).get();
  const course = withId(snap);
  if (!course) throw createHttpError(404, 'Course not found');
  return course;
}

export async function updateCourse(courseId, patch) {
  const id = normalizeString(courseId);
  if (!id) throw createHttpError(400, 'Invalid courseId');

  const updates = pickAllowedFields(patch, { partial: true });
  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, 'No valid fields provided for update');
  }

  const ref = coursesCollection().doc(id);
  const existing = await ref.get();
  if (!existing.exists) throw createHttpError(404, 'Course not found');

  await ref.update(updates);
  const after = await ref.get();
  return withId(after);
}

export async function deleteCourse(courseId) {
  const id = normalizeString(courseId);
  if (!id) throw createHttpError(400, 'Invalid courseId');

  const ref = coursesCollection().doc(id);
  const existing = await ref.get();
  if (!existing.exists) throw createHttpError(404, 'Course not found');

  await ref.delete();
  return { ok: true };
}
