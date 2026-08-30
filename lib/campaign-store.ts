// Persists donation initiatives (campaigns) to disk, following the same
// pattern as lib/event-store.ts. Server-only - never import from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Campaign } from './mock-data';

export type CampaignInput = Omit<Campaign, 'id' | 'slug' | 'createdAt'> & { slug?: string };

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'campaigns.json');

function readCampaigns(): Campaign[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as Campaign[];
  } catch {
    return [];
  }
}

function writeCampaigns(campaigns: Campaign[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(campaigns, null, 2), 'utf-8');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'initiative';
}

function uniqueSlug(base: string, excludeId?: string): string {
  const campaigns = readCampaigns();
  let slug = base;
  let counter = 2;
  while (campaigns.some((c) => c.slug === slug && c.id !== excludeId)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export function getCampaigns(): Campaign[] {
  return readCampaigns().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCampaignById(id: string): Campaign | undefined {
  return readCampaigns().find((c) => c.id === id);
}

export function createCampaign(input: CampaignInput): Campaign {
  const campaigns = readCampaigns();
  const campaign: Campaign = {
    ...input,
    id: randomUUID(),
    slug: uniqueSlug(slugify(input.slug || input.title)),
    createdAt: new Date().toISOString(),
  };
  campaigns.push(campaign);
  writeCampaigns(campaigns);
  return campaign;
}

export function updateCampaign(id: string, input: CampaignInput): Campaign | null {
  const campaigns = readCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const slug = uniqueSlug(slugify(input.slug || input.title), id);
  campaigns[index] = { ...campaigns[index], ...input, slug };
  writeCampaigns(campaigns);
  return campaigns[index];
}

export function deleteCampaign(id: string): boolean {
  const campaigns = readCampaigns();
  const next = campaigns.filter((c) => c.id !== id);
  if (next.length === campaigns.length) return false;
  writeCampaigns(next);
  return true;
}
