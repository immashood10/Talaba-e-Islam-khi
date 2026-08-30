// Persists "seen" receipts for stories, following the same pattern as
// lib/event-registration-store.ts. Server-only - never import from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export interface StoryView {
  storyId: string;
  viewerId: string;
  viewerName: string;
  viewerEmail?: string;
  viewedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'story-views.json');

function readViews(): StoryView[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as StoryView[];
  } catch {
    return [];
  }
}

function writeViews(views: StoryView[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(views, null, 2), 'utf-8');
}

// First view wins, like WhatsApp - re-watching doesn't move you down the list.
export function recordStoryView(input: { storyId: string; viewerId: string; viewerName: string; viewerEmail?: string }): void {
  const views = readViews();
  const alreadySeen = views.some((v) => v.storyId === input.storyId && v.viewerId === input.viewerId);
  if (alreadySeen) return;

  views.push({ ...input, viewedAt: new Date().toISOString() });
  writeViews(views);
}

export function getViewsForStory(storyId: string): StoryView[] {
  return readViews()
    .filter((v) => v.storyId === storyId)
    .sort((a, b) => a.viewedAt.localeCompare(b.viewedAt));
}

export function getViewCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of readViews()) {
    counts[v.storyId] = (counts[v.storyId] ?? 0) + 1;
  }
  return counts;
}

export function deleteViewsForStory(storyId: string): void {
  const views = readViews();
  const next = views.filter((v) => v.storyId !== storyId);
  if (next.length !== views.length) writeViews(next);
}
