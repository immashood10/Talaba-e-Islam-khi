// Normalizes common YouTube link formats (watch, youtu.be, live) into an
// embeddable /embed/ URL, since YouTube blocks framing its regular pages
// with X-Frame-Options. Non-YouTube URLs are returned unchanged, since the
// admin is expected to supply an embed-ready URL for those providers.

export function toEmbeddableUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const host = url.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
  }

  if (host === 'youtube.com') {
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
    }

    if (url.pathname.startsWith('/live/')) {
      const id = url.pathname.split('/')[2];
      return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
    }
  }

  return rawUrl;
}

export function isYouTubeEmbedUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.hostname.replace(/^www\./, '') === 'youtube.com' && url.pathname.startsWith('/embed/');
  } catch {
    return false;
  }
}

// Strips the YouTube player down to just the video - no control bar, no
// related videos, no share/watch-on-YouTube buttons - autoplaying muted
// like a TV feed. enablejsapi lets the page's own mute toggle control
// audio via postMessage, since hiding the controls also hides YouTube's.
export function toChromelessYouTubeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('mute', '1');
  url.searchParams.set('controls', '0');
  url.searchParams.set('rel', '0');
  url.searchParams.set('iv_load_policy', '3');
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('disablekb', '1');
  url.searchParams.set('fs', '0');
  url.searchParams.set('enablejsapi', '1');
  return url.toString();
}
