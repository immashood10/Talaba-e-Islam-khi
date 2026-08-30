'use client';

import { useEffect, useState } from 'react';
import type { Story } from '@/lib/story-store';
import { getSeenStoryIds, markStorySeen } from '@/lib/story-seen';

const POLL_INTERVAL_MS = 60000;

export function useStoryRing() {
  const [stories, setStories] = useState<Story[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    setSeenIds(getSeenStoryIds());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/stories');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStories(data.stories ?? []);
      } catch {
        // ignore transient fetch errors
      }
    };
    fetchStories();
    const interval = setInterval(fetchStories, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const markSeen = (storyId: string) => {
    markStorySeen(storyId);
    setSeenIds((prev) => (prev.has(storyId) ? prev : new Set(prev).add(storyId)));
  };

  return {
    stories,
    hasStories: stories.length > 0,
    hasUnseen: stories.some((s) => !seenIds.has(s.id)),
    isViewerOpen,
    openViewer: () => setIsViewerOpen(true),
    closeViewer: () => setIsViewerOpen(false),
    markSeen,
  };
}
