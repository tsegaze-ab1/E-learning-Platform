import { admin, firestore as db } from '../config/firebase.js';
import { createHttpError } from './httpError.js';

const COLLECTION = 'content';
const CONTENT_TYPES = new Set(['pdf', 'image', 'audio', 'youtube']);

function ensureDb() {
  if (!db) {
    throw createHttpError(
      500,
      'Firestore is not configured. Configure Firebase Admin credentials before using content APIs.',
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
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    throw createHttpError(400, 'Invalid weekNumber: must be an integer between 1 and 10');
  }
  return n;
}

function toDoc(snapshot) {
  if (!snapshot?.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

function validateCreate(payload) {
  const body = payload ?? {};

  const title = normalizeString(body.title);
  const description = normalizeString(body.description);
  const type = normalizeString(body.type);
  const url = normalizeString(body.url);

  if (!title) throw createHttpError(400, 'Missing required field: title');
  if (!description) throw createHttpError(400, 'Missing required field: description');
  if (!type) throw createHttpError(400, 'Missing required field: type');
  if (!CONTENT_TYPES.has(type)) throw createHttpError(400, 'Invalid type. Use pdf, image, audio, or youtube');
  if (!url) throw createHttpError(400, 'Missing required field: url');

  return {
    title,
    description,
    type,
    url,
    weekNumber: normalizeWeekNumber(body.weekNumber),
    youtubeUrl: normalizeString(body.youtubeUrl) ?? '',
    thumbnailUrl: normalizeString(body.thumbnailUrl) ?? '',
    source: normalizeString(body.source) ?? 'manual',
  };
}

function validatePatch(payload) {
  const body = payload ?? {};
  const updates = {};

  if ('title' in body) {
    const title = normalizeString(body.title);
    if (!title) throw createHttpError(400, 'Invalid title');
    updates.title = title;
  }

  if ('description' in body) {
    const description = normalizeString(body.description);
    if (!description) throw createHttpError(400, 'Invalid description');
    updates.description = description;
  }

  if ('type' in body) {
    const type = normalizeString(body.type);
    if (!type || !CONTENT_TYPES.has(type)) {
      throw createHttpError(400, 'Invalid type. Use pdf, image, audio, or youtube');
    }
    updates.type = type;
  }

  if ('url' in body) {
    const url = normalizeString(body.url);
    if (!url) throw createHttpError(400, 'Invalid url');
    updates.url = url;
  }

  if ('youtubeUrl' in body) {
    updates.youtubeUrl = normalizeString(body.youtubeUrl) ?? '';
  }

  if ('thumbnailUrl' in body) {
    updates.thumbnailUrl = normalizeString(body.thumbnailUrl) ?? '';
  }

  if ('source' in body) {
    updates.source = normalizeString(body.source) ?? 'manual';
  }

  if ('weekNumber' in body) {
    updates.weekNumber = normalizeWeekNumber(body.weekNumber);
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, 'No valid fields provided for update');
  }

  return updates;
}

function contentCollection() {
  return ensureDb().collection(COLLECTION);
}

export async function getAllContent() {
  const snap = await contentCollection().orderBy('createdAt', 'desc').get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getContentById(id) {
  const contentId = normalizeString(id);
  if (!contentId) throw createHttpError(400, 'Invalid content id');

  const snap = await contentCollection().doc(contentId).get();
  const content = toDoc(snap);
  if (!content) throw createHttpError(404, 'Content not found');
  return content;
}

export async function createContent(payload, { createdByUid } = {}) {
  const data = validateCreate(payload);

  const ref = await contentCollection().add({
    ...data,
    createdByUid: createdByUid ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const snap = await ref.get();
  return toDoc(snap);
}

export async function updateContent(id, patch) {
  const contentId = normalizeString(id);
  if (!contentId) throw createHttpError(400, 'Invalid content id');

  const ref = contentCollection().doc(contentId);
  const existing = await ref.get();
  if (!existing.exists) throw createHttpError(404, 'Content not found');

  const updates = validatePatch(patch);
  await ref.update(updates);
  const after = await ref.get();
  return toDoc(after);
}

export async function deleteContent(id) {
  const contentId = normalizeString(id);
  if (!contentId) throw createHttpError(400, 'Invalid content id');

  const ref = contentCollection().doc(contentId);
  const existing = await ref.get();
  if (!existing.exists) throw createHttpError(404, 'Content not found');

  await ref.delete();
  return { ok: true };
}
