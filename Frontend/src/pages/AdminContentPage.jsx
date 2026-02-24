import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import {
  createContentItem,
  deleteContentItem,
  subscribeToContent,
  uploadContentFile,
} from '../services/contentService.js';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const WEEK_LIST = Array.from({ length: 10 }, (_, index) => index + 1);

function buildValidation({ title, description, type, url, weekNumber, file }) {
  if (!title.trim()) return 'Title is required.';
  if (!description.trim()) return 'Description is required.';
  if (!type) return 'Content type is required.';
  if (!Number.isInteger(Number(weekNumber)) || Number(weekNumber) < 1 || Number(weekNumber) > 10) {
    return 'Week must be between 1 and 10.';
  }

  if (['pdf', 'image', 'audio'].includes(type) && !url.trim() && !file) {
    return 'Upload a file or provide a valid URL for this content.';
  }

  if (type === 'youtube' && !url.trim()) {
    return 'YouTube link is required.';
  }

  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    return 'File exceeds 20MB size limit.';
  }

  return '';
}

export default function AdminContentPage() {
  const { profile, firebaseUser } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('pdf');
  const [weekNumber, setWeekNumber] = useState(1);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToContent({
      onData: (data) => {
        setItems(data);
        setLoading(false);
        setError('');
      },
      onError: (err) => {
        setLoading(false);
        setError(err?.message ?? 'Failed to load content.');
      },
    });

    return () => unsubscribe();
  }, []);

  const formError = useMemo(
    () => buildValidation({ title, description, type, url, weekNumber, file }),
    [title, description, type, url, weekNumber, file],
  );

  const canSubmit = !submitting && !formError && profile?.role === 'admin';

  async function handleCreate(e) {
    e.preventDefault();
    if (!canSubmit) {
      if (formError) setError(formError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let finalUrl = url.trim();
      let source = 'manual';

      if (file) {
        const uploaded = await uploadContentFile(file);
        finalUrl = uploaded?.url ?? finalUrl;
        source = 'cloudinary';
      }

      await createContentItem({
        title: title.trim(),
        description: description.trim(),
        type,
        weekNumber: Number(weekNumber),
        url: finalUrl,
        source,
      });

      setTitle('');
      setDescription('');
      setUrl('');
      setFile(null);
      setType('pdf');
      setWeekNumber(1);
    } catch (err) {
      setError(err?.message ?? 'Failed to create content.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteContentItem(id);
    } catch (err) {
      setError(err?.message ?? 'Delete failed.');
    }
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Content Manager</h1>
          <p className="mt-1 text-sm text-slate-300">
            Upload or link PDF, image, audio, and YouTube content for students.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {profile?.role ? <Badge className="border-amber-400/35 bg-amber-500/15 text-amber-200">{profile.role}</Badge> : null}
          {firebaseUser?.email ? <Badge className="border-slate-700 bg-slate-900 text-slate-300">{firebaseUser.email}</Badge> : null}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold text-white">Add New Content</h2>
        <p className="mt-1 text-sm text-slate-300">Only admin users can add or delete content.</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        ) : null}

        {!error && formError ? (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200">{formError}</div>
        ) : null}

        <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Title</label>
            <div className="mt-1"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Week title" /></div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <div className="mt-1"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this content" /></div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">Week</label>
            <select value={weekNumber} onChange={(e) => setWeekNumber(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100">
              {WEEK_LIST.map((week) => (
                <option key={week} value={week}>{`week-${week}`}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Link (URL)</label>
            <div className="mt-1"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Upload file (PDF/Image/Audio, max 20MB)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".pdf,image/*,audio/*"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-sm text-slate-200"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={!canSubmit}>{submitting ? 'Saving...' : 'Add Content'}</Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold text-white">Published Content</h2>
        {loading ? <p className="mt-2 text-sm text-slate-300">Loading content...</p> : null}

        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/35">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-amber-400/35 bg-amber-500/15 text-amber-200">{item.type}</Badge>
                    <Badge className="border-slate-700 bg-slate-900 text-slate-300">{`week-${item.weekNumber ?? 'n/a'}`}</Badge>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-amber-200 no-underline hover:text-amber-100">
                    Open resource →
                  </a>
                </div>

                {profile?.role === 'admin' ? (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
