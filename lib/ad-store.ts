// Persists sidebar ads to disk, following the same pattern as lib/event-store.ts.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface Ad {
  id: string;
  advertiserName: string;
  imageUrl: string;
  linkUrl: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'ads.json');

function readAds(): Ad[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as Ad[];
  } catch {
    return [];
  }
}

function writeAds(ads: Ad[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(ads, null, 2), 'utf-8');
}

export function getAds(): Ad[] {
  return readAds().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAdById(id: string): Ad | undefined {
  return readAds().find((a) => a.id === id);
}

export function createAd(input: { advertiserName: string; imageUrl: string; linkUrl: string }): Ad {
  const ads = readAds();
  const now = new Date().toISOString();
  const ad: Ad = {
    id: randomUUID(),
    advertiserName: input.advertiserName,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
    createdAt: now,
    updatedAt: now,
  };
  ads.push(ad);
  writeAds(ads);
  return ad;
}

export function updateAd(
  id: string,
  updates: { advertiserName: string; imageUrl: string; linkUrl: string },
): Ad | null {
  const ads = readAds();
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) return null;

  ads[index] = { ...ads[index], ...updates, updatedAt: new Date().toISOString() };
  writeAds(ads);
  return ads[index];
}

export function deleteAd(id: string): boolean {
  const ads = readAds();
  const next = ads.filter((a) => a.id !== id);
  if (next.length === ads.length) return false;
  writeAds(next);
  return true;
}
