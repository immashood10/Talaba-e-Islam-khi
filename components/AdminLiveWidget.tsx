'use client';

// Floating live-stream preview shown in the bottom-right of every admin
// page whenever something is live, so the admin can keep an eye on the
// output while working. Sits above the global WhatsApp button.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { resolveLive, type ResolvedLive } from '@/lib/resolve-live';
import { toChromelessYouTubeUrl } from '@/lib/video-embed';
import { useLiveSocket } from '@/lib/use-live-socket';
import WebRTCPlayer from '@/components/WebRTCPlayer';

const POLL_MS = 10000;

function SpeakerMutedIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6" />
    </svg>
  );
}

function SpeakerIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
      <path strokeLinecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
    </svg>
  );
}

export default function AdminLiveWidget() {
  const [live, setLive] = useState<ResolvedLive | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const toggleMute = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({ event: 'command', func: isMuted ? 'unMute' : 'mute', args: [] }),
      'https://www.youtube.com'
    );
    setIsMuted(!isMuted);
  };

  const handleEndLive = async () => {
    if (!confirm('End the live stream? Viewers will see it go offline.')) return;
    setIsEnding(true);
    try {
      const res = await fetch('/api/admin/live/stop', { method: 'POST' });
      if (res.ok) setLive(null);
    } catch (err) {
      console.error('Error ending live stream:', err);
    } finally {
      setIsEnding(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      resolveLive()
        .then((resolved) => {
          if (!cancelled) setLive(resolved);
        })
        .catch(() => {});
    };

    check();
    const interval = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Socket.IO pushes make the widget react instantly instead of waiting
  // for the next poll; the interval above stays as a fallback.
  const socketStatus = useLiveSocket();
  const lastSocketLiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (socketStatus === null) return;
    if (lastSocketLiveRef.current === socketStatus.isLive) return;
    lastSocketLiveRef.current = socketStatus.isLive;
    resolveLive()
      .then(setLive)
      .catch(() => {});
  }, [socketStatus]);

  if (!live) return null;

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-24 right-5 md:right-6 z-40 flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        LIVE
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-5 md:right-6 z-40 w-72 sm:w-80 rounded-xl bg-white shadow-soft-lg border border-gray-200 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <Link
            href="/live"
            target="_blank"
            className="truncate text-sm font-semibold text-secondary hover:text-primary transition-colors"
            title={live.title}
          >
            {live.title}
          </Link>
          {socketStatus && socketStatus.viewers > 0 && (
            <span className="shrink-0 text-xs text-text-light">
              {socketStatus.viewers} watching
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          aria-label="Minimize live preview"
          className="ml-2 shrink-0 rounded p-1 text-text-light hover:bg-gray-100 hover:text-secondary transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="relative aspect-video w-full bg-black">
        {live.provider === 'webrtc' ? (
          <WebRTCPlayer
            whepUrl={`${live.embedUrl}/whep`}
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={live.provider === 'youtube' ? toChromelessYouTubeUrl(live.embedUrl) : live.embedUrl}
            title={`Live preview: ${live.title}`}
            className="w-full h-full pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        )}
        {live.provider === 'youtube' && (
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="absolute bottom-2 right-2 flex items-center justify-center h-7 w-7 rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            {isMuted ? <SpeakerMutedIcon /> : <SpeakerIcon />}
          </button>
        )}
      </div>

      <button
        onClick={handleEndLive}
        disabled={isEnding}
        className="w-full bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
      >
        {isEnding ? 'Ending...' : 'End Live'}
      </button>
    </div>
  );
}
