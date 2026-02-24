import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subscribeToCourse } from '../services/coursesService.js';
import { extractYouTubeId } from '../utils/youtube.js';
import Card, { CardContent, CardHeader } from '../components/ui/Card.jsx';

export default function StudentCourseDetails() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-zinc-700">Loading course…</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <Link to="/student" className="text-sm font-medium text-zinc-900">
          Back to courses
        </Link>
        <div className="rounded-xl bg-red-50 p-5 text-sm text-red-700 ring-1 ring-inset ring-red-100">{error}</div>
      </div>
    );
  }

  const videoId = extractYouTubeId(course?.youtubeUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-900">
            {course?.title}
          </h1>
          <p className="mt-1 text-sm leading-6 text-zinc-600">{course?.description}</p>
        </div>
        <Link to="/student" className="text-sm font-medium text-zinc-900">
          Back
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-900">Video</h2>
            <p className="mt-1 text-sm text-zinc-600">Watch the YouTube lesson.</p>
          </CardHeader>

          <CardContent>

            {videoId ? (
              <div className="mt-3 overflow-hidden rounded-xl bg-black ring-1 ring-inset ring-zinc-200">
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700 ring-1 ring-inset ring-zinc-200">
                Invalid YouTube URL.{' '}
                <a className="font-medium text-zinc-900" href={course?.youtubeUrl} target="_blank" rel="noreferrer">
                  Open link
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-900">Audio</h2>
            <p className="mt-1 text-sm text-zinc-600">Play the audio material.</p>
          </CardHeader>

          <CardContent>

            {course?.audioUrl ? (
              <div className="mt-3">
                <audio className="w-full" controls src={course.audioUrl} />
                <div className="mt-2 text-xs text-zinc-600">
                  <a className="font-medium text-zinc-900" href={course.audioUrl} target="_blank" rel="noreferrer">
                    Open audio link
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700 ring-1 ring-inset ring-zinc-200">
                No audio URL.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
