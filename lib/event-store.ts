// Persists events to disk, following the same pattern as lib/product-store.ts.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface EventSpeaker {
  name: string;
  title?: string;
}

export interface EventDocument {
  name: string;
  url: string;
}

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  bannerImage?: string;
  thumbnail?: string;
  date: string; // yyyy-mm-dd
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  timeZone: string;
  location: string;
  mapsLink?: string;
  category: string;
  speakers: EventSpeaker[];
  organizer: string;
  registrationRequired: boolean;
  registrationLimit?: number;
  isFeatured: boolean;
  liveStreamEnabled: boolean;
  liveStreamUrl?: string;
  isLive: boolean;
  isCancelled: boolean;
  isPublished: boolean;
  remindersEnabled: boolean;
  gallery: string[];
  documents: EventDocument[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

export type EventInput = {
  title: string;
  subtitle?: string;
  description: string;
  bannerImage?: string;
  thumbnail?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  timeZone: string;
  location: string;
  mapsLink?: string;
  category: string;
  speakers: EventSpeaker[];
  organizer: string;
  registrationRequired: boolean;
  registrationLimit?: number;
  isFeatured: boolean;
  liveStreamEnabled: boolean;
  liveStreamUrl?: string;
  remindersEnabled: boolean;
  gallery: string[];
  documents: EventDocument[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'events.json');

function readEvents(): Event[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as Event[];
  } catch {
    return [];
  }
}

function writeEvents(events: Event[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');
}

export function getEvents(): Event[] {
  return readEvents().sort((a, b) => a.date.localeCompare(b.date));
}

// Events visible to the public site: published, regardless of status (a
// cancelled event should still be visible with a "Cancelled" badge, not
// disappear silently).
export function getPublishedEvents(): Event[] {
  return getEvents().filter((e) => e.isPublished);
}

export function getEventById(id: string): Event | undefined {
  return readEvents().find((e) => e.id === id);
}

function baseFields(input: EventInput) {
  return {
    title: input.title,
    subtitle: input.subtitle || undefined,
    description: input.description,
    bannerImage: input.bannerImage || undefined,
    thumbnail: input.thumbnail || undefined,
    date: input.date,
    startTime: input.startTime || undefined,
    endTime: input.endTime || undefined,
    timeZone: input.timeZone || 'Asia/Karachi',
    location: input.location,
    mapsLink: input.mapsLink || undefined,
    category: input.category,
    speakers: input.speakers,
    organizer: input.organizer,
    registrationRequired: input.registrationRequired,
    registrationLimit: input.registrationRequired ? input.registrationLimit : undefined,
    isFeatured: input.isFeatured,
    liveStreamEnabled: input.liveStreamEnabled,
    liveStreamUrl: input.liveStreamEnabled ? input.liveStreamUrl || undefined : undefined,
    remindersEnabled: input.remindersEnabled,
    gallery: input.gallery,
    documents: input.documents,
    tags: input.tags,
    seoTitle: input.seoTitle || undefined,
    seoDescription: input.seoDescription || undefined,
    seoKeywords: input.seoKeywords || undefined,
  };
}

export function createEvent(input: EventInput): Event {
  const events = readEvents();
  const now = new Date().toISOString();
  const event: Event = {
    id: randomUUID(),
    ...baseFields(input),
    isLive: false,
    isCancelled: false,
    isPublished: false,
    createdAt: now,
    updatedAt: now,
  };
  events.push(event);
  writeEvents(events);
  return event;
}

export function updateEvent(id: string, input: EventInput): Event | null {
  const events = readEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = { ...events[index], ...baseFields(input), updatedAt: new Date().toISOString() };
  writeEvents(events);
  return events[index];
}

export function deleteEvent(id: string): boolean {
  const events = readEvents();
  const next = events.filter((e) => e.id !== id);
  if (next.length === events.length) return false;
  writeEvents(next);
  return true;
}

export function duplicateEvent(id: string): Event | null {
  const source = getEventById(id);
  if (!source) return null;

  const events = readEvents();
  const now = new Date().toISOString();
  const copy: Event = {
    ...source,
    id: randomUUID(),
    title: `${source.title} (Copy)`,
    isPublished: false,
    isCancelled: false,
    isLive: false,
    createdAt: now,
    updatedAt: now,
  };
  events.push(copy);
  writeEvents(events);
  return copy;
}

function setFlag(id: string, updates: Partial<Pick<Event, 'isPublished' | 'isCancelled' | 'isLive'>>): Event | null {
  const events = readEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = { ...events[index], ...updates, updatedAt: new Date().toISOString() };
  writeEvents(events);
  return events[index];
}

export function setEventPublished(id: string, isPublished: boolean): Event | null {
  return setFlag(id, { isPublished });
}

export function setEventCancelled(id: string, isCancelled: boolean): Event | null {
  return setFlag(id, isCancelled ? { isCancelled, isLive: false } : { isCancelled });
}

export function setEventLive(id: string, isLive: boolean): Event | null {
  return setFlag(id, { isLive });
}
