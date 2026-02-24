export function extractYouTubeId(url) {
  if (!url) return undefined;

  try {
    const u = new URL(url);

    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;

      const parts = u.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }

    if (u.hostname === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return id;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
