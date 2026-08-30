// Shared request-body validation for event create/update routes.
// Server-only (imported only from API routes).

import type { EventInput, EventDocument, EventSpeaker } from './event-store';

export type ValidateEventResult = { ok: true; data: EventInput } | { ok: false; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidTime(value: unknown): boolean {
  return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function validateEventInput(body: unknown): ValidateEventResult {
  const b = (body ?? {}) as Record<string, unknown>;

  if (!isNonEmptyString(b.title) || b.title.length < 2) {
    return { ok: false, error: 'Please enter an event title' };
  }
  if (!isNonEmptyString(b.description) || b.description.length < 2) {
    return { ok: false, error: 'Please enter a description' };
  }
  if (typeof b.date !== 'string' || Number.isNaN(Date.parse(b.date))) {
    return { ok: false, error: 'Please enter a valid event date' };
  }
  if (b.startTime !== undefined && b.startTime !== '' && !isValidTime(b.startTime)) {
    return { ok: false, error: 'Start time must be in HH:MM format' };
  }
  if (b.endTime !== undefined && b.endTime !== '' && !isValidTime(b.endTime)) {
    return { ok: false, error: 'End time must be in HH:MM format' };
  }
  if (!isNonEmptyString(b.location)) {
    return { ok: false, error: 'Please enter a location' };
  }
  if (!isNonEmptyString(b.category)) {
    return { ok: false, error: 'Please choose a category' };
  }
  if (!isNonEmptyString(b.organizer)) {
    return { ok: false, error: 'Please enter an organizer' };
  }
  if (typeof b.registrationRequired !== 'boolean') {
    return { ok: false, error: 'Invalid registration setting' };
  }
  if (b.registrationRequired) {
    if (b.registrationLimit !== undefined && b.registrationLimit !== null) {
      if (typeof b.registrationLimit !== 'number' || !Number.isInteger(b.registrationLimit) || b.registrationLimit < 1) {
        return { ok: false, error: 'Registration limit must be a positive number' };
      }
    }
  }
  if (typeof b.isFeatured !== 'boolean') {
    return { ok: false, error: 'Invalid featured setting' };
  }
  if (typeof b.liveStreamEnabled !== 'boolean') {
    return { ok: false, error: 'Invalid live stream setting' };
  }
  if (b.liveStreamEnabled && b.liveStreamUrl !== undefined && b.liveStreamUrl !== '' && typeof b.liveStreamUrl !== 'string') {
    return { ok: false, error: 'Invalid live stream URL' };
  }
  if (typeof b.remindersEnabled !== 'boolean') {
    return { ok: false, error: 'Invalid reminders setting' };
  }

  const speakers = Array.isArray(b.speakers)
    ? (b.speakers as unknown[]).filter(
        (s): s is EventSpeaker => typeof s === 'object' && s !== null && isNonEmptyString((s as Record<string, unknown>).name),
      )
    : [];

  const documents = Array.isArray(b.documents)
    ? (b.documents as unknown[]).filter(
        (d): d is EventDocument =>
          typeof d === 'object' &&
          d !== null &&
          isNonEmptyString((d as Record<string, unknown>).name) &&
          isNonEmptyString((d as Record<string, unknown>).url),
      )
    : [];

  const gallery = Array.isArray(b.gallery) ? (b.gallery as unknown[]).filter((g): g is string => typeof g === 'string') : [];

  const tags = Array.isArray(b.tags)
    ? (b.tags as unknown[]).filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : [];

  return {
    ok: true,
    data: {
      title: (b.title as string).trim(),
      subtitle: isNonEmptyString(b.subtitle) ? b.subtitle.trim() : undefined,
      description: (b.description as string).trim(),
      bannerImage: isNonEmptyString(b.bannerImage) ? b.bannerImage : undefined,
      thumbnail: isNonEmptyString(b.thumbnail) ? b.thumbnail : undefined,
      date: b.date as string,
      startTime: isNonEmptyString(b.startTime) ? (b.startTime as string) : undefined,
      endTime: isNonEmptyString(b.endTime) ? (b.endTime as string) : undefined,
      timeZone: isNonEmptyString(b.timeZone) ? (b.timeZone as string) : 'Asia/Karachi',
      location: (b.location as string).trim(),
      mapsLink: isNonEmptyString(b.mapsLink) ? b.mapsLink.trim() : undefined,
      category: (b.category as string).trim(),
      speakers,
      organizer: (b.organizer as string).trim(),
      registrationRequired: b.registrationRequired as boolean,
      registrationLimit: (b.registrationRequired as boolean) ? (b.registrationLimit as number | undefined) : undefined,
      isFeatured: b.isFeatured as boolean,
      liveStreamEnabled: b.liveStreamEnabled as boolean,
      liveStreamUrl: (b.liveStreamEnabled as boolean) && isNonEmptyString(b.liveStreamUrl) ? (b.liveStreamUrl as string).trim() : undefined,
      remindersEnabled: b.remindersEnabled as boolean,
      gallery,
      documents,
      tags,
      seoTitle: isNonEmptyString(b.seoTitle) ? b.seoTitle.trim() : undefined,
      seoDescription: isNonEmptyString(b.seoDescription) ? b.seoDescription.trim() : undefined,
      seoKeywords: isNonEmptyString(b.seoKeywords) ? b.seoKeywords.trim() : undefined,
    },
  };
}
