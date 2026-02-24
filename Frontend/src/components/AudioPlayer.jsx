import Card, { CardContent, CardHeader } from './ui/Card.jsx';

export default function AudioPlayer({ src, title = 'Audio material' }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-white">Audio material</h2>
        <p className="mt-1 text-sm text-slate-300">Listen while you review the lesson.</p>
      </CardHeader>
      <CardContent>
        {src ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 ring-1 ring-inset ring-slate-700 p-3">
              <audio className="w-full" controls src={src} aria-label={title} />
            </div>
            <a
              className="inline-flex text-sm font-semibold text-amber-200 no-underline hover:text-amber-100"
              href={src}
              target="_blank"
              rel="noreferrer"
            >
              Open audio link →
            </a>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300 ring-1 ring-inset ring-slate-700">
            <div className="font-medium text-white">No audio available</div>
            <div className="mt-1 text-slate-300">This course doesn’t include an audio file yet.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
