// Talks to the MediaMTX control API to check whether the "live" path is
// receiving a stream, and builds the ingest/playback URLs shown in the
// admin panel and embedded on the public /live page.

const API_URL = () => process.env.MEDIAMTX_API_URL || 'http://localhost:9997';

export interface StreamStatus {
  isLive: boolean;
  viewers: number;
}

export async function getStreamStatus(): Promise<StreamStatus> {
  try {
    const res = await fetch(`${API_URL()}/v3/paths/get/live`, { cache: 'no-store' });
    if (!res.ok) return { isLive: false, viewers: 0 };
    const data = await res.json();
    return {
      isLive: Boolean(data.ready),
      viewers: Array.isArray(data.readers) ? data.readers.length : 0,
    };
  } catch {
    // MediaMTX not running
    return { isLive: false, viewers: 0 };
  }
}

export function isMediamtxReachable(): Promise<boolean> {
  return fetch(`${API_URL()}/v3/paths/list`, { cache: 'no-store' })
    .then((res) => res.ok)
    .catch(() => false);
}

const kickEndpoints: Record<string, string> = {
  rtmpConn: 'rtmpconns',
  rtspSession: 'rtspsessions',
  srtConn: 'srtconns',
  webRTCSession: 'webrtcsessions',
};

// Force-disconnects whatever is currently publishing to the "live" path.
// Note: encoders with auto-reconnect (OBS default) may rejoin - the admin
// should also stop the stream at the source.
export async function kickPublisher(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL()}/v3/paths/get/live`, { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    const source = data.source as { type?: string; id?: string } | null;
    const endpoint = source?.type ? kickEndpoints[source.type] : undefined;
    if (!endpoint || !source?.id) return false;

    const kick = await fetch(`${API_URL()}/v3/${endpoint}/kick/${source.id}`, { method: 'POST' });
    return kick.ok;
  } catch {
    return false;
  }
}

export interface IngestInfo {
  rtmpUrl: string;
  rtmpStreamKey: string;
  srtUrl: string;
  playerUrl: string;
  hlsUrl: string;
}

export function getIngestInfo(): IngestInfo {
  const host = process.env.MEDIAMTX_PUBLIC_HOST || 'localhost';
  const user = process.env.MEDIAMTX_PUBLISH_USER || 'publisher';
  const pass = process.env.MEDIAMTX_PUBLISH_PASS || 'change-this-stream-password';

  return {
    rtmpUrl: `rtmp://${host}:1935`,
    rtmpStreamKey: `live?user=${user}&pass=${pass}`,
    srtUrl: `srt://${host}:8890?streamid=publish:live:${user}:${pass}`,
    playerUrl: getPublicPlayerUrl(),
    hlsUrl: getPublicHlsUrl(),
  };
}

export function getPublicPlayerUrl(): string {
  const base = process.env.MEDIAMTX_PUBLIC_WEBRTC_URL
    || `http://${process.env.MEDIAMTX_PUBLIC_HOST || 'localhost'}:8889`;
  return `${base}/live`;
}

// HLS has higher latency than the WebRTC player used on the website, but is
// natively playable by expo-video with no custom WebRTC/WHEP client needed -
// used for the mobile app's Live tab.
export function getPublicHlsUrl(): string {
  const host = process.env.MEDIAMTX_PUBLIC_HOST || 'localhost';
  const base = process.env.MEDIAMTX_PUBLIC_HLS_URL || `http://${host}:8888`;
  return `${base}/live/index.m3u8`;
}
