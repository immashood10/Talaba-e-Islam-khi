import { NextResponse } from 'next/server';
import { getPublicHlsUrl, getPublicPlayerUrl, getStreamStatus } from '@/lib/mediamtx';

const CACHE_TTL_MS = 5000;
let cache: { expiresAt: number; body: { isLive: boolean; playbackUrl: string | null; hlsUrl: string | null } } | null = null;

export async function GET() {
  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.body);
  }

  const status = await getStreamStatus();
  const body = {
    isLive: status.isLive,
    playbackUrl: status.isLive ? getPublicPlayerUrl() : null,
    // HLS variant of the same stream, for clients that can't do WebRTC/WHEP
    // playback (the mobile app's native video player).
    hlsUrl: status.isLive ? getPublicHlsUrl() : null,
  };

  cache = { expiresAt: Date.now() + CACHE_TTL_MS, body };
  return NextResponse.json(body);
}
