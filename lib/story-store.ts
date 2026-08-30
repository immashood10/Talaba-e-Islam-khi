// Persists logo stories to disk, following the same pattern as lib/ad-store.ts.
// Stories auto-expire 24 hours after creation, WhatsApp-status style.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export type StoryMediaType = 'image' | 'video';

export interface Story {
  id: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  caption?: string;
  createdAt: string;
  expiresAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'stories.json');
const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

// Older records were written with an `imageUrl` field and no `mediaType`
// (back when stories were image-only). Normalize on read so the rest of the
// app only ever sees the current shape.
function readStories(): Story[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    const raw = JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as Array<Partial<Story> & { imageUrl?: string }>;
    return raw.map((s) => ({
      id: s.id ?? randomUUID(),
      mediaUrl: s.mediaUrl ?? s.imageUrl ?? '',
      mediaType: s.mediaType ?? 'image',
      caption: s.caption,
      createdAt: s.createdAt ?? new Date().toISOString(),
      expiresAt: s.expiresAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

function writeStories(stories: Story[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(stories, null, 2), 'utf-8');
}

export function isStoryExpired(story: Story, now: Date = new Date()): boolean {
  return new Date(story.expiresAt).getTime() <= now.getTime();
}

// Full history, newest first - for the admin dashboard.
export function getAllStories(): Story[] {
  return readStories().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Only unexpired stories, oldest first - the order visitors view them in.
export function getActiveStories(): Story[] {
  const now = new Date();
  return readStories()
    .filter((s) => !isStoryExpired(s, now))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getStoryById(id: string): Story | undefined {
  return readStories().find((s) => s.id === id);
}

export function createStory(input: { mediaUrl: string; mediaType: StoryMediaType; caption?: string }): Story {
  const stories = readStories();
  const now = new Date();
  const story: Story = {
    id: randomUUID(),
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
    caption: input.caption,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + STORY_LIFETIME_MS).toISOString(),
  };
  stories.push(story);
  writeStories(stories);
  return story;
}

export function updateStory(
  id: string,
  updates: { mediaUrl: string; mediaType: StoryMediaType; caption?: string },
): Story | null {
  const stories = readStories();
  const index = stories.findIndex((s) => s.id === id);
  if (index === -1) return null;

  stories[index] = {
    ...stories[index],
    mediaUrl: updates.mediaUrl,
    mediaType: updates.mediaType,
    caption: updates.caption,
  };
  writeStories(stories);
  return stories[index];
}

export function deleteStory(id: string): boolean {
  const stories = readStories();
  const next = stories.filter((s) => s.id !== id);
  if (next.length === stories.length) return false;
  writeStories(next);
  return true;
}
