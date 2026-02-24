import { auth } from '../config/firebase.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

function extractError(payload, fallback) {
  if (payload?.error?.message) return payload.error.message;
  if (payload?.message) return payload.message;
  return fallback;
}

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in.');
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extractError(payload, `Request failed (${response.status})`));
  }
  return payload;
}

export async function fetchContentList() {
  const payload = await request('/content');
  return Array.isArray(payload?.content) ? payload.content : [];
}

export function subscribeToContent({ onData, onError }) {
  let disposed = false;

  const load = async () => {
    try {
      const content = await fetchContentList();
      if (!disposed) onData(content);
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

export async function uploadContentFile(file) {
  const headers = await authHeaders();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/content/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extractError(payload, `Upload failed (${response.status})`));
  }

  return payload?.file;
}

export async function createContentItem(data) {
  const headers = {
    ...(await authHeaders()),
    'Content-Type': 'application/json',
  };

  const payload = await request('/content', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  return payload?.content;
}

export async function updateContentItem(id, patch) {
  const headers = {
    ...(await authHeaders()),
    'Content-Type': 'application/json',
  };

  const payload = await request(`/content/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(patch),
  });

  return payload?.content;
}

export async function deleteContentItem(id) {
  const headers = await authHeaders();
  await request(`/content/${id}`, {
    method: 'DELETE',
    headers,
  });
}
