// Persists the current live post (set by the admin Live section) to disk so
// it survives dev-server recompiles and server restarts. Client components
// must only import the LivePost type from here - never the functions.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export interface LivePost {
  title: string;
  description: string;
  streamUrl: string;
  isActive: boolean;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'live-post.json');

export function getLivePost(): LivePost | null {
  try {
    if (!existsSync(FILE_PATH)) return null;
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as LivePost;
  } catch {
    return null;
  }
}

export function setLivePost(post: Omit<LivePost, 'updatedAt'>): LivePost {
  const saved: LivePost = { ...post, updatedAt: new Date().toISOString() };
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(saved, null, 2), 'utf-8');
  return saved;
}
