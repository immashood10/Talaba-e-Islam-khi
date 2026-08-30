// Client-side helper that decides what (if anything) is currently live:
// the self-hosted MediaMTX broadcast takes priority, then a manually
// activated stream link from the admin Live section.

import type { LivePost } from '@/lib/live-store';
import { isYouTubeEmbedUrl } from '@/lib/video-embed';

// 'webrtc' = self-hosted MediaMTX stream played natively via WHEP;
// 'youtube' = YouTube embed controlled via the iframe API;
// 'iframe' = any other embed URL, no programmatic control available.
export type LiveProvider = 'webrtc' | 'youtube' | 'iframe';

export interface ResolvedLive {
  title: string;
  description: string;
  embedUrl: string;
  provider: LiveProvider;
}

export async function resolveLive(): Promise<ResolvedLive | null> {
  const [broadcastRes, liveRes] = await Promise.all([
    fetch('/api/broadcast/status').then((res) => res.json()),
    fetch('/api/live').then((res) => res.json()),
  ]);

  const post: LivePost | null = liveRes.live;

  if (broadcastRes.isLive && broadcastRes.playbackUrl) {
    return {
      title: post?.title || 'Live Now',
      description: post?.description || '',
      embedUrl: broadcastRes.playbackUrl,
      provider: 'webrtc',
    };
  }

  if (post?.isActive) {
    return {
      title: post.title,
      description: post.description,
      embedUrl: post.streamUrl,
      provider: isYouTubeEmbedUrl(post.streamUrl) ? 'youtube' : 'iframe',
    };
  }

  return null;
}
