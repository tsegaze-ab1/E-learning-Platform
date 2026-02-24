import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import Badge from '../components/ui/Badge.jsx';
import { extractYouTubeId } from '../utils/youtube.js';
import { subscribeToContent } from '../services/contentService.js';

function ContentCard({ item, index }) {
  const animationStyle = { animationDelay: `${Math.min(index * 45, 360)}ms` };

  return (
    <article
      className="translate-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 opacity-0 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-amber-400/35 motion-safe:animate-[fadeInUp_480ms_ease_forwards]"
      style={animationStyle}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-amber-400/35 bg-amber-500/15 text-amber-200">{item.type}</Badge>
        <Badge className="border-slate-700 bg-slate-900 text-slate-300">{`week-${item.weekNumber ?? 'n/a'}`}</Badge>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-white">{item.title}</h3>
      <p className="mt-1 text-sm text-slate-300">{item.description}</p>

      <div className="mt-4">
        {item.type === 'image' ? (
          <img src={item.url} alt={item.title} className="max-h-72 w-full rounded-xl object-cover" loading="lazy" />
        ) : null}

        {item.type === 'audio' ? (
          <audio className="w-full" controls src={item.url} aria-label={item.title} />
        ) : null}

        {item.type === 'pdf' ? (
          <div className="space-y-2">
            <iframe title={item.title} src={item.url} className="h-72 w-full rounded-xl border border-slate-700 bg-slate-950" />
            <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-amber-200 no-underline hover:text-amber-100">
              Download / Open PDF →
            </a>
          </div>
        ) : null}

        {item.type === 'youtube' ? (
          (() => {
            const id = extractYouTubeId(item.url);
            if (!id) {
              return (
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-amber-200 no-underline hover:text-amber-100">
                  Open YouTube link →
                </a>
              );
            }

            return (
              <div className="overflow-hidden rounded-xl border border-slate-700">
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    title={item.title}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          })()
        ) : null}
      </div>
    </article>
  );
}

export default function StudentDashboard() {
  const [searchParams] = useSearchParams();
  const { firebaseUser, profile } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedWeek = Number(searchParams.get('week')) || null;
  const view = searchParams.get('view') ?? 'content';

  useEffect(() => {
    const unsubscribe = subscribeToContent({
      onData: (data) => {
        setContent(data);
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

  const grouped = useMemo(() => {
    const byWeek = new Map();

    const filtered = selectedWeek
      ? content.filter((item) => Number(item.weekNumber) === selectedWeek)
      : content;

    filtered.forEach((item) => {
      const week = Number(item.weekNumber) || 0;
      if (!byWeek.has(week)) byWeek.set(week, []);
      byWeek.get(week).push(item);
    });

    return Array.from(byWeek.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([week, items]) => ({ week, items }));
  }, [content, selectedWeek]);

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Student Dashboard</h1>
          <p className="mt-1 text-sm text-slate-300">All admin-published learning content is shown here.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {profile?.role ? <Badge className="border-amber-400/35 bg-amber-500/15 text-amber-200">{profile.role}</Badge> : null}
          {firebaseUser?.email ? <Badge className="border-slate-700 bg-slate-900 text-slate-300">{firebaseUser.email}</Badge> : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6 text-sm text-slate-300">Loading content...</div>
      ) : null}

      {!loading && view === 'quiz' ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-200">
          {selectedWeek
            ? `Quiz placeholder for week-${selectedWeek}. Add quiz module next.`
            : 'Quiz placeholder. Select a week from the sidebar quizzes list.'}
        </div>
      ) : null}

      {!loading && view !== 'quiz' && grouped.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6 text-sm text-slate-300">
          {selectedWeek ? `No content for week-${selectedWeek} yet.` : 'No content published yet.'}
        </div>
      ) : null}

      {!loading && view !== 'quiz' && grouped.length > 0
        ? grouped.map((weekGroup) => (
            <section key={weekGroup.week} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">{`week-${weekGroup.week}`}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {weekGroup.items.map((item, index) => (
                  <ContentCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>
          ))
        : null}
    </div>
  );
}
