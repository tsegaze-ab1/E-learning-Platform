import { useEffect, useMemo, useState } from 'react';
import { cn } from '../lib/cn.js';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import Textarea from './ui/Textarea.jsx';

function isValidUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AddCourseModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = 'Add course',
  description = 'Create a new course with media links and a thumbnail.',
  submitLabel = 'Create course',
}) {
  const [enter, setEnter] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setSaving(false);

    setCourseTitle(initialValues?.title ?? '');
    setCourseDescription(initialValues?.description ?? '');
    setWeekNumber(initialValues?.weekNumber ?? 1);
    setThumbnailUrl(initialValues?.thumbnailUrl ?? '');
    setYoutubeUrl(initialValues?.youtubeUrl ?? '');
    setAudioUrl(initialValues?.audioUrl ?? '');
    setPdfUrl(initialValues?.pdfUrl ?? '');

    const t = setTimeout(() => setEnter(true), 10);
    return () => clearTimeout(t);
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const validation = useMemo(() => {
    const trimmedTitle = courseTitle.trim();
    const trimmedDescription = courseDescription.trim();

    if (!trimmedTitle) return { ok: false, message: 'Title is required.' };
    if (trimmedTitle.length < 3) return { ok: false, message: 'Title must be at least 3 characters.' };

    if (!trimmedDescription) return { ok: false, message: 'Description is required.' };
    if (trimmedDescription.length < 10) return { ok: false, message: 'Description must be at least 10 characters.' };

    if (!Number.isInteger(Number(weekNumber)) || Number(weekNumber) < 1 || Number(weekNumber) > 10) {
      return { ok: false, message: 'Week must be between 1 and 10.' };
    }

    if (!isValidUrl(thumbnailUrl.trim())) return { ok: false, message: 'Thumbnail URL must be a valid http(s) URL.' };
    if (!isValidUrl(youtubeUrl.trim())) return { ok: false, message: 'YouTube link must be a valid http(s) URL.' };
    if (!isValidUrl(audioUrl.trim())) return { ok: false, message: 'Audio link must be a valid http(s) URL.' };
    if (!isValidUrl(pdfUrl.trim())) return { ok: false, message: 'PDF link must be a valid http(s) URL.' };

    return { ok: true, message: '' };
  }, [courseTitle, courseDescription, weekNumber, thumbnailUrl, youtubeUrl, audioUrl, pdfUrl]);

  const canSubmit = validation.ok && !saving;

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validation.ok || saving) {
      if (!validation.ok) setError(validation.message);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSubmit({
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        weekNumber: Number(weekNumber),
        thumbnailUrl: thumbnailUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        audioUrl: audioUrl.trim(),
        pdfUrl: pdfUrl.trim(),
      });
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      open
      aria-label={title}
      className="fixed inset-0 z-50 m-0 h-full w-full bg-transparent p-0"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/30 transition-opacity duration-200',
          enter ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close modal"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 top-14 mx-auto w-[92vw] max-w-2xl">
        <div
          className={cn(
            'rounded-2xl border border-slate-800 bg-slate-900/95 p-0 shadow-2xl shadow-black/35 transition-all duration-200',
            enter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 p-5">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{title}</div>
              <div className="mt-1 text-sm text-slate-300">{description}</div>
            </div>
            <button type="button" className="ds-btn ds-btn-ghost h-9 px-3" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="p-5">
            {error ? (
              <div className="rounded-2xl border border-red-400/35 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {!error && !validation.ok ? (
              <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 p-4 text-sm text-amber-200">
                {validation.message}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block" htmlFor="acm-title">
                <span className="text-sm font-medium text-slate-300">Title</span>
                <div className="mt-1">
                  <Input
                    id="acm-title"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    disabled={saving}
                    required
                    placeholder="Intro to C++"
                  />
                </div>
              </label>

              <label className="block" htmlFor="acm-description">
                <span className="text-sm font-medium text-slate-300">Description</span>
                <div className="mt-1">
                  <Textarea
                    id="acm-description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    disabled={saving}
                    required
                    rows={4}
                    placeholder="What students will learn in this course"
                  />
                </div>
              </label>

              <label className="block" htmlFor="acm-week">
                <span className="text-sm font-medium text-slate-300">Week</span>
                <div className="mt-1">
                  <Input
                    id="acm-week"
                    type="number"
                    min={1}
                    max={10}
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block" htmlFor="acm-thumb">
                  <span className="text-sm font-medium text-slate-300">Thumbnail URL</span>
                  <div className="mt-1">
                    <Input
                      id="acm-thumb"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      disabled={saving}
                      placeholder="https://…/thumbnail.jpg"
                      inputMode="url"
                    />
                  </div>
                </label>

                <label className="block" htmlFor="acm-youtube">
                  <span className="text-sm font-medium text-slate-300">YouTube link</span>
                  <div className="mt-1">
                    <Input
                      id="acm-youtube"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      disabled={saving}
                      placeholder="https://www.youtube.com/watch?v=…"
                      inputMode="url"
                    />
                  </div>
                </label>
              </div>

              <label className="block" htmlFor="acm-audio">
                <span className="text-sm font-medium text-slate-300">Audio link</span>
                <div className="mt-1">
                  <Input
                    id="acm-audio"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    disabled={saving}
                    placeholder="https://…/audio.mp3"
                    inputMode="url"
                  />
                </div>
              </label>

              <label className="block" htmlFor="acm-pdf">
                <span className="text-sm font-medium text-slate-300">PDF link</span>
                <div className="mt-1">
                  <Input
                    id="acm-pdf"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    disabled={saving}
                    placeholder="https://…/note.pdf"
                    inputMode="url"
                  />
                </div>
              </label>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {saving ? 'Saving…' : submitLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
}
