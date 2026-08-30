// Browser-only helpers backing the story ring: a stable anonymous id for
// guests (so admin can count their views without an account), and a local
// cache of which stories this browser has already opened (so the ring can
// switch from "new" to "seen" instantly, without waiting on a member session).

const SEEN_KEY = 'tei_seen_story_ids';
const VIEWER_KEY = 'tei_story_viewer_id';

export function getSeenStoryIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markStorySeen(storyId: string): void {
  if (typeof window === 'undefined') return;
  const ids = getSeenStoryIds();
  if (ids.has(storyId)) return;
  ids.add(storyId);
  window.localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

export function getStoryViewerId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(VIEWER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VIEWER_KEY, id);
  }
  return id;
}
