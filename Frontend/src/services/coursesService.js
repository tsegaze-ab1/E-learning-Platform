import { auth } from '../config/firebase.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

function toErrorMessage(payload, fallback) {
  if (payload?.error?.message) return payload.error.message;
  if (payload?.message) return payload.message;
  return fallback;
}

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in.');
  }

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(toErrorMessage(payload, `Request failed (${response.status})`));
  }

  return payload;
}

export async function fetchCourses() {
  const payload = await request('/courses');
  return Array.isArray(payload?.courses) ? payload.courses : [];
}

export async function fetchCourseById(courseId) {
  const payload = await request(`/courses/${courseId}`);
  return payload?.course ?? null;
}

export function subscribeToCourses({ onData, onError }) {
  let disposed = false;

  const load = async () => {
    try {
      const courses = await fetchCourses();
      if (!disposed) onData(courses);
    } catch (err) {
      if (!disposed) onError(err);
    }
  };

  load();
  const timer = setInterval(load, 5000);

  return () => {
    disposed = true;
    clearInterval(timer);
  };
}

export function subscribeToCourse({ courseId, onData, onError }) {
  let disposed = false;

  const load = async () => {
    try {
      const course = await fetchCourseById(courseId);
      if (!disposed) onData(course);
    } catch (err) {
      if (!disposed) onError(err);
    }
  };

  load();
  const timer = setInterval(load, 5000);

  return () => {
    disposed = true;
    clearInterval(timer);
  };
}

export async function createCourse({ title, description, weekNumber, youtubeUrl, audioUrl, pdfUrl, thumbnailUrl }) {
  const headers = await getAuthHeaders();

  const payload = await request('/courses', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: title.trim(),
      description: description.trim(),
      weekNumber,
      youtubeUrl: youtubeUrl?.trim() ?? '',
      audioUrl: audioUrl?.trim() ?? '',
      pdfUrl: pdfUrl?.trim() ?? '',
      thumbnailUrl: thumbnailUrl?.trim() ?? '',
    }),
  });

  return payload?.course;
}

export async function updateCourse(courseId, { title, description, weekNumber, youtubeUrl, audioUrl, pdfUrl, thumbnailUrl }) {
  const headers = await getAuthHeaders();

  const payload = await request(`/courses/${courseId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      title: title.trim(),
      description: description.trim(),
      weekNumber,
      youtubeUrl: youtubeUrl?.trim() ?? '',
      audioUrl: audioUrl?.trim() ?? '',
      pdfUrl: pdfUrl?.trim() ?? '',
      thumbnailUrl: thumbnailUrl?.trim() ?? '',
    }),
  });

  return payload?.course;
}

export async function deleteCourse(courseId) {
  const headers = await getAuthHeaders();

  await request(`/courses/${courseId}`, {
    method: 'DELETE',
    headers,
  });
}
