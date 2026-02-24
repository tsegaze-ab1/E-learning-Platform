import Card, { CardContent, CardHeader } from './ui/Card.jsx';
import { extractYouTubeId } from '../utils/youtube.js';

export default function VideoPlayer({ youtubeUrl, title = 'Course video' }) {
  const videoId = extractYouTubeId(youtubeUrl);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-white">Video lesson</h2>
        <p className="mt-1 text-sm text-slate-300">Watch the lesson and take notes.</p>
      </CardHeader>
      <CardContent>
        {videoId ? (
          <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-inset ring-slate-700">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={title}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            <div className="font-medium text-amber-200">Invalid YouTube URL</div>
            <div className="mt-1 text-slate-300">
              Update the course video link to a valid YouTube URL.
            </div>
            {youtubeUrl ? (
              <a
                className="mt-3 inline-flex text-sm font-semibold text-amber-200 no-underline hover:text-amber-100"
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open provided link →
              </a>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
