// Pure, isomorphic status/countdown math for events - safe to import from
// both server (API routes) and client (components) code. No I/O here.

export type EventStatus = 'upcoming' | 'today' | 'live' | 'completed' | 'cancelled';

export interface EventStatusInput {
  date: string; // yyyy-mm-dd
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  isCancelled: boolean;
  isLive: boolean;
}

function parseDateParts(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d };
}

function endOfEventDateTime(date: string, endTime?: string): Date {
  const { y, m, d } = parseDateParts(date);
  if (endTime) {
    const [h, min] = endTime.split(':').map(Number);
    return new Date(y, m - 1, d, h, min, 0);
  }
  return new Date(y, m - 1, d, 23, 59, 59);
}

function startOfEventDateTime(date: string, startTime?: string): Date {
  const { y, m, d } = parseDateParts(date);
  if (startTime) {
    const [h, min] = startTime.split(':').map(Number);
    return new Date(y, m - 1, d, h, min, 0);
  }
  return new Date(y, m - 1, d, 0, 0, 0);
}

function isSameCalendarDay(date: string, now: Date): boolean {
  const { y, m, d } = parseDateParts(date);
  return now.getFullYear() === y && now.getMonth() === m - 1 && now.getDate() === d;
}

// Live status is a manual admin toggle (Go Live / End Live) rather than
// inferred from the clock - there is no reliable way to auto-detect an
// external stream (YouTube/Zoom/etc.) starting, so admin action is the
// single source of truth for "live has started".
export function computeEventStatus(event: EventStatusInput, now: Date = new Date()): EventStatus {
  if (event.isCancelled) return 'cancelled';
  if (event.isLive) return 'live';
  if (now.getTime() > endOfEventDateTime(event.date, event.endTime).getTime()) return 'completed';
  if (isSameCalendarDay(event.date, now)) return 'today';

  const { y, m, d } = parseDateParts(event.date);
  const eventDay = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (eventDay.getTime() > today.getTime()) return 'upcoming';
  return 'completed';
}

export function formatCountdown(event: EventStatusInput, now: Date = new Date()): string {
  const status = computeEventStatus(event, now);
  if (status === 'live') return 'Live Now 🔴';
  if (status === 'completed') return 'Event Completed';
  if (status === 'cancelled') return 'Event Cancelled';

  const target = startOfEventDateTime(event.date, event.startTime);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'Starting Soon';

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (status === 'today') {
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
  if (days === 1) return 'Tomorrow';
  if (days > 1) return hours > 0 ? `${days} Days ${hours} Hours` : `${days} Days`;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export const EVENT_CATEGORIES = [
  'Religious Gathering',
  'Conference',
  'Charity Drive',
  'Educational',
  'Community',
  'Youth Program',
  'Other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
