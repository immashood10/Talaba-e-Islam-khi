'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { resolveLive, type ResolvedLive } from '@/lib/resolve-live';
import { toChromelessYouTubeUrl } from '@/lib/video-embed';
import { siteImages } from '@/lib/image-assets';
import { useLiveSocket } from '@/lib/use-live-socket';
import WebRTCPlayer from '@/components/WebRTCPlayer';

const LIVE_CACHE_KEY = 'live-cache-v3';

function readCache(): ResolvedLive | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LIVE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as ResolvedLive) : null;
  } catch {
    return null;
  }
}

function writeCache(post: ResolvedLive | null) {
  try {
    if (post) {
      sessionStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(post));
    } else {
      sessionStorage.removeItem(LIVE_CACHE_KEY);
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) - ignore
  }
}

function SpeakerMutedIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6" />
    </svg>
  );
}

function SpeakerIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
      <path strokeLinecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
    </svg>
  );
}

function PlayIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

function PauseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function ExpandIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" />
    </svg>
  );
}

function CompressIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3a2 2 0 01-2 2H3M16 3v3a2 2 0 002 2h3M8 21v-3a2 2 0 00-2-2H3M16 21v-3a2 2 0 012-2h3" />
    </svg>
  );
}

function WhatsAppLogoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M19.11 17.15c-.26-.13-1.53-.76-1.77-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.03-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.08-1.27-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.39.11-.52.11-.11.26-.3.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.44-.07-.13-.58-1.4-.79-1.91-.21-.5-.42-.43-.58-.44h-.5c-.17 0-.44.07-.67.32-.24.26-.9.88-.9 2.15 0 1.27.93 2.5 1.06 2.67.13.17 1.82 2.78 4.41 3.89.62.27 1.1.43 1.48.55.62.2 1.19.17 1.64.1.5-.08 1.53-.63 1.74-1.24.22-.61.22-1.13.15-1.24-.06-.1-.23-.17-.49-.29zm-3.02 8.82h-.01a12.8 12.8 0 0 1-6.53-1.79l-.47-.28-4.86 1.28 1.3-4.74-.31-.49a12.77 12.77 0 1 1 10.88 6.02zm10.92-12.8A16 16 0 0 0 5.66 2.35a15.87 15.87 0 0 0-2.5 19l-1.67 6.08 6.23-1.63a15.94 15.94 0 0 0 7.62 1.95h.01A15.99 15.99 0 0 0 26.98 13.17z" />
    </svg>
  );
}

function FacebookLogoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7h2.4l.36-2.8H13.5V9.4c0-.81.22-1.36 1.38-1.36h1.48V5.55c-.26-.03-1.13-.11-2.15-.11-2.13 0-3.59 1.3-3.59 3.69v2.06H8.2V14h2.42v7h2.88z" />
    </svg>
  );
}

function InstagramLogoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function LivePage() {
  const [live, setLive] = useState<ResolvedLive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [linkCopied, setLinkCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);

  const isWebRTC = live?.provider === 'webrtc';
  const isYT = live?.provider === 'youtube';

  const sendPlayerCommand = (func: string, args: (string | number)[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      'https://www.youtube.com'
    );
  };

  const toggleMute = () => {
    if (isWebRTC) {
      const video = nativeVideoRef.current;
      if (video) video.muted = !isMuted;
    } else {
      sendPlayerCommand(isMuted ? 'unMute' : 'mute');
    }
    setIsMuted(!isMuted);
  };

  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (isWebRTC) {
      const video = nativeVideoRef.current;
      if (video) {
        if (isPlaying) video.pause();
        else video.play().catch(() => {});
      }
    } else {
      sendPlayerCommand(isPlaying ? 'pauseVideo' : 'playVideo');
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (isWebRTC) {
      const video = nativeVideoRef.current;
      if (video) {
        video.volume = value / 100;
        video.muted = value === 0;
      }
      setIsMuted(value === 0);
      return;
    }
    sendPlayerCommand('setVolume', [value]);
    if (value === 0) {
      sendPlayerCommand('mute');
      setIsMuted(true);
    } else if (isMuted) {
      sendPlayerCommand('unMute');
      setIsMuted(false);
    }
  };

  const shareText = `Watch live: ${live?.title || 'Talaba e Islam Karachi'}`;

  const handleInstagramShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: live?.title || 'Live', text: shareText, url });
        return;
      } catch {
        // user dismissed the share sheet - fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // clipboard unavailable - ignore
    }
  };

  const videoBoxRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const el = videoBoxRef.current;
    if (!el) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => void;
    };
    const box = el as HTMLDivElement & { webkitRequestFullscreen?: () => void };

    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else doc.webkitExitFullscreen?.();
    } else {
      if (box.requestFullscreen) box.requestFullscreen();
      else box.webkitRequestFullscreen?.();
    }
  };

  // Double tap (touch) or double click (mouse), unified via pointerup
  const handleVideoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) toggleFullscreen();
    lastTapRef.current = now;
  };

  useEffect(() => {
    const doc = document as Document & { webkitFullscreenElement?: Element };
    const onChange = () => setIsFullscreen(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setLive(cached);
      setIsLoading(false);
    }

    resolveLive()
      .then((resolved) => {
        setLive(resolved);
        writeCache(resolved);
      })
      .catch((err) => console.error('Error fetching live status:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Real-time updates from the Socket.IO status service: switch the page
  // the moment a broadcast starts/stops, without a manual refresh.
  const socketStatus = useLiveSocket();
  const lastSocketLiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (socketStatus === null) return;
    if (lastSocketLiveRef.current === socketStatus.isLive) return;
    lastSocketLiveRef.current = socketStatus.isLive;

    resolveLive()
      .then((resolved) => {
        setLive(resolved);
        writeCache(resolved);
        setIsLoading(false);
      })
      .catch(() => {});
  }, [socketStatus]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="card animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-6" />
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ) : live ? (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-sm font-semibold text-red-500 tracking-wide">LIVE NOW</span>
                {socketStatus && socketStatus.viewers > 0 && (
                  <span className="ml-2 text-sm text-text-light">
                    {socketStatus.viewers} watching
                  </span>
                )}
              </div>

              <div ref={videoBoxRef} className="w-full rounded-xl overflow-hidden shadow-soft-lg mb-6 bg-black flex flex-col">
                <div className="relative w-full flex-1 min-h-0 aspect-video">
                  {isWebRTC ? (
                    <WebRTCPlayer
                      whepUrl={`${live.embedUrl}/whep`}
                      videoRef={nativeVideoRef}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      ref={iframeRef}
                      src={isYT ? toChromelessYouTubeUrl(live.embedUrl) : live.embedUrl}
                      title={live.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}

                  {/* Double-tap-to-fullscreen capture layer. Not rendered for
                      unknown iframe embeds, which need their own controls tappable. */}
                  {(isYT || isWebRTC) && (
                    <div
                      className="absolute inset-0 touch-manipulation"
                      onPointerUp={handleVideoTap}
                    />
                  )}

                  {/* Channel logo watermark */}
                  <div className="absolute top-3 right-3 pointer-events-none animate-float">
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-2 ring-white/70 shadow-glow">
                      <Image
                        src={siteImages.logo}
                        alt="Talaba e Islam Karachi"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Static media player control bar */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-gray-900 px-3 sm:px-4 py-2.5 text-white">
                  {(isYT || isWebRTC) && (
                    <>
                      <button
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                      <button
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
                      >
                        {isMuted ? <SpeakerMutedIcon /> : <SpeakerIcon />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        aria-label="Volume"
                        className="w-20 sm:w-28 accent-primary cursor-pointer"
                      />
                    </>
                  )}

                  <div className="flex-1" />

                  {linkCopied && (
                    <span className="text-xs text-emerald-400 animate-fade-in">Link copied!</span>
                  )}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] transition-transform hover:scale-110"
                  >
                    <WhatsAppLogoIcon className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] transition-transform hover:scale-110"
                  >
                    <FacebookLogoIcon className="h-5 w-5" />
                  </a>
                  <button
                    onClick={handleInstagramShare}
                    aria-label="Share on Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] transition-transform hover:scale-110"
                  >
                    <InstagramLogoIcon className="h-5 w-5" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
                  >
                    {isFullscreen ? <CompressIcon /> : <ExpandIcon />}
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-secondary mb-2">{live.title}</h1>
              {live.description && (
                <p className="text-text-light mb-6">{live.description}</p>
              )}

              <a
                href="https://www.youtube.com/@TalabaeislamKarachiT.I.K"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-soft hover:shadow-soft-lg transition-shadow max-w-md"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                  <Image src={siteImages.logo} alt="Talaba e Islam Karachi" fill sizes="48px" className="object-cover" />
                </div>
                <span className="text-sm font-medium text-secondary">
                  Subscribe us on YouTube channel for more videos
                </span>
              </a>
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">📡</div>
              <h1 className="text-2xl font-bold text-secondary mb-2">
                No live stream right now
              </h1>
              <p className="text-text-light">
                Check back soon — we&apos;ll be live here when a broadcast is running.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
