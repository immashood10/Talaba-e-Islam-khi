'use client';

import { useEffect, useRef, useState } from 'react';
import type { Story } from '@/lib/story-store';
import { getStoryViewerId } from '@/lib/story-seen';
import { promptGoogleOneTap } from '@/lib/google-one-tap';
import { useMember } from '@/lib/member-context';

const SLIDE_DURATION_MS = 5000;
const TICK_MS = 50;
const CAPTION_WORD_LIMIT = 100;

function truncateWords(text: string, limit: number): { truncated: string; wordCount: number } {
  const words = text.trim().split(/\s+/);
  return { truncated: words.slice(0, limit).join(' '), wordCount: words.length };
}

function CloseIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MutedIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 9 17 15M17 9l6 6" />
    </svg>
  );
}

function UnmutedIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
    </svg>
  );
}

export default function StoryViewer({
  stories,
  initialIndex = 0,
  onClose,
  onSeen,
}: {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onSeen: (storyId: string) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const recordedRef = useRef<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const { member, login } = useMember();

  const current = stories[index];
  const caption = current?.caption ?? '';
  const { truncated: truncatedCaption, wordCount: captionWordCount } = truncateWords(caption, CAPTION_WORD_LIMIT);
  const isCaptionLong = captionWordCount > CAPTION_WORD_LIMIT;
  const isVideo = current?.mediaType === 'video';
  const shouldHoldPlayback = isPaused || isCaptionExpanded;

  // Best-effort: try to identify the viewer by their Gmail via Google One
  // Tap so their name/email (not just "Guest") shows up in the admin's
  // "seen by" list. Silent no-op if there's no active Google session, the
  // client id isn't configured, or the user dismisses the prompt.
  useEffect(() => {
    if (member) return;
    promptGoogleOneTap((credential) => {
      fetch('/api/auth/google/one-tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.member) login(data.member);
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = () => {
    if (index >= stories.length - 1) {
      onClose();
      return;
    }
    setIndex((i) => i + 1);
  };

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  useEffect(() => {
    if (!current) return;
    setProgress(0);
    setIsCaptionExpanded(false);

    onSeen(current.id);
    if (!recordedRef.current.has(current.id)) {
      recordedRef.current.add(current.id);
      fetch(`/api/stories/${current.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId: getStoryViewerId() }),
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Images advance on a fixed timer; videos drive their own progress via
  // onTimeUpdate/onEnded below, so this timer only runs for images.
  useEffect(() => {
    if (!current || isVideo || shouldHoldPlayback) return;

    const start = Date.now() - progress * (SLIDE_DURATION_MS / 100);
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        goNext();
      }
    }, TICK_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isVideo, shouldHoldPlayback]);

  // Play/pause the actual <video> element to match hold-to-pause and the
  // "reading a long caption" state - a fixed timer wouldn't make sense here.
  useEffect(() => {
    if (!isVideo) return;
    const video = videoRef.current;
    if (!video) return;

    if (shouldHoldPlayback) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isVideo, shouldHoldPlayback, index]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 animate-fade-in">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black sm:h-[92vh] sm:rounded-2xl">
        <div className="absolute inset-x-0 top-0 z-10 flex gap-1 p-2">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white"
                style={{ width: `${i < index ? 100 : i === index ? progress : 0}%`, transition: i === index ? 'none' : 'width 150ms linear' }}
              />
            </div>
          ))}
        </div>

        <div className="absolute right-2 top-6 z-20 flex items-center gap-1">
          {isVideo && (
            <button
              type="button"
              onClick={() => setIsMuted((v) => !v)}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            >
              {isMuted ? <MutedIcon /> : <UnmutedIcon />}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close story"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        <div
          className="relative flex-1 bg-black"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption -- story videos have no caption track to attach
            <video
              key={current.id}
              ref={videoRef}
              src={current.mediaUrl}
              autoPlay
              muted={isMuted}
              playsInline
              className="h-full w-full object-contain"
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                if (video.duration > 0) setProgress((video.currentTime / video.duration) * 100);
              }}
              onEnded={goNext}
              onError={goNext}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL, matches ads pattern
            <img src={current.mediaUrl} alt={current.caption ?? 'Story'} className="h-full w-full object-contain" />
          )}

          {caption && (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 to-transparent p-4 pt-12">
              {isCaptionLong ? (
                <>
                  <p
                    className={`text-sm text-white ${
                      isCaptionExpanded ? 'max-h-[45vh] overflow-y-auto whitespace-pre-wrap' : ''
                    }`}
                  >
                    {isCaptionExpanded ? caption : `${truncatedCaption}…`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCaptionExpanded((v) => !v)}
                    className="mt-1 text-xs font-semibold text-white/80 underline underline-offset-2"
                  >
                    {isCaptionExpanded ? 'Show less' : 'Read full text'}
                  </button>
                </>
              ) : (
                <p className="text-sm text-white">{caption}</p>
              )}
            </div>
          )}

          <button type="button" aria-label="Previous story" onClick={goPrev} className="absolute left-0 top-0 h-full w-1/3" />
          <button type="button" aria-label="Next story" onClick={goNext} className="absolute right-0 top-0 h-full w-1/3" />
        </div>
      </div>
    </div>
  );
}
