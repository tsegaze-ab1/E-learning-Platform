import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '../lib/cn.js';
import { subscribeToCourse } from '../services/coursesService.js';
import Badge from '../components/ui/Badge.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import AudioPlayer from '../components/AudioPlayer.jsx';

export default function CourseDetailsPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCourse({
      courseId,
      onData: (data) => {
        if (!data) {
          setCourse(null);
          setLoading(false);
          setError('Course not found');
          return;
        }

        setCourse(data);
        setLoading(false);
        setError('');
      },
      onError: (err) => {
        setLoading(false);
        setError(err?.message ?? 'Failed to load course');
      },
    });

    return () => unsubscribe();
  }, [courseId]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => setEnter(true), 20);
    return () => clearTimeout(t);
  }, [loading]);

  const meta = useMemo(() => {
    const title = course?.title ?? 'Untitled course';
    const description = course?.description ?? '';
    return { title, description };
  }, [course]);

  if (loading) {
    return (
      <div className="space-y-6 text-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="h-7 w-56 animate-pulse rounded bg-slate-800" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-800" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded bg-slate-800" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="ds-card overflow-hidden p-0">
            <div className="aspect-video w-full animate-pulse bg-slate-800" />
            <div className="p-4">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-800" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-800" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-800" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="ds-card p-4">
              <div className="h-4 w-36 animate-pulse rounded bg-slate-800" />
              <div className="mt-3 h-10 w-full animate-pulse rounded bg-slate-800" />
            </div>
            <div className="ds-card p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-800" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <Link to="/student" className="inline-flex text-sm font-semibold text-amber-200 no-underline hover:text-amber-100">
          ← Back to courses
        </Link>
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'space-y-6 transition-all duration-300',
        enter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-amber-400/35 bg-amber-500/15 text-amber-200">Course</Badge>
            <Badge className="border-slate-700 bg-slate-900 text-slate-300">Student</Badge>
          </div>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white">
            {meta.title}
          </h1>
          {meta.description ? (
            <p className="mt-1 text-sm leading-6 text-slate-300">{meta.description}</p>
          ) : null}
        </div>

        <Link to="/student" className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-700 px-3 text-sm font-medium text-slate-200 no-underline transition hover:border-amber-400/40 hover:text-amber-200">
          Back
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <VideoPlayer youtubeUrl={course?.youtubeUrl} title={`${meta.title} video`} />
        </div>

        <div className="space-y-6">
          <AudioPlayer src={course?.audioUrl} title={`${meta.title} audio`} />

          {course?.pdfUrl ? (
            <div className="ds-card p-5">
              <div className="text-sm font-semibold text-white">PDF notes</div>
              <p className="mt-2 text-sm text-slate-300">Open the weekly PDF resource for this lesson.</p>
              <a
                className="mt-3 inline-flex text-sm font-semibold text-amber-200 no-underline hover:text-amber-100"
                href={course.pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF →
              </a>
            </div>
          ) : null}

          <div className="ds-card p-5">
            <div className="text-sm font-semibold text-white">About this course</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              {meta.description || 'No description provided yet.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
