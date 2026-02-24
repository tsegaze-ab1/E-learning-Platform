import { Link } from 'react-router-dom';
import { cn } from '../lib/cn.js';
import { extractYouTubeId } from '../utils/youtube.js';

function clamp01(n) {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function getYouTubeThumb(youtubeUrl) {
  const id = extractYouTubeId(youtubeUrl);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export default function CourseCard({ course, to, progress = 0 }) {
  const safeProgress = clamp01(Number(progress));
  const thumbnailUrl = course?.thumbnailUrl || getYouTubeThumb(course?.youtubeUrl) || null;

  let progressPill = `${safeProgress}%`;
  if (safeProgress === 0) progressPill = 'Not started';
  if (safeProgress >= 100) progressPill = 'Completed';

  const Container = to ? Link : 'div';
  const containerProps = to ? { to } : {};

  return (
    <Container
      {...containerProps}
      className={cn(
        'group block ds-card ds-card-hover overflow-hidden p-0 no-underline',
        to ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2' : '',
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course?.title ? `${course.title} thumbnail` : 'Course thumbnail'}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25">
              <span className="text-sm font-semibold">{(course?.title ?? 'C').slice(0, 1).toUpperCase()}</span>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent opacity-90" />

        <div className="absolute left-3 top-3 rounded-full border border-amber-400/30 bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-amber-200">
          {progressPill}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-white">
              {course?.title ?? 'Untitled course'}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">
              {course?.description ?? 'No description yet.'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-slate-300">Progress</span>
            <span className="tabular-nums text-slate-400">{safeProgress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-inset ring-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-[width] duration-500"
              style={{ width: `${safeProgress}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {to ? (
          <div className="mt-4 text-xs font-semibold text-amber-200">
            Open course <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </div>
        ) : null}
      </div>
    </Container>
  );
}
