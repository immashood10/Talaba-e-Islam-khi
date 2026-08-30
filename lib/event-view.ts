// Enriches a raw Event with server-computed fields (status, registration
// counts) for API responses. Server-only - pulls from event-registration-store.

import { getRegistrationCountForEvent } from './event-registration-store';
import { computeEventStatus, formatCountdown, type EventStatus } from './event-status';
import { getEvents, type Event } from './event-store';

export interface EventWithMeta extends Event {
  status: EventStatus;
  registrationCount: number;
  remainingSeats: number | null;
}

export function toEventWithMeta(event: Event): EventWithMeta {
  const registrationCount = getRegistrationCountForEvent(event.id);
  const remainingSeats =
    event.registrationRequired && event.registrationLimit != null
      ? Math.max(0, event.registrationLimit - registrationCount)
      : null;

  return {
    ...event,
    status: computeEventStatus(event),
    registrationCount,
    remainingSeats,
  };
}

export interface EventReminder {
  eventId: string;
  title: string;
  status: EventStatus;
  message: string;
}

// Computed fresh on every call (no persistence, no cron) - reminders for
// events happening soon, for display in the admin notification bell.
export function getEventReminders(): EventReminder[] {
  const now = new Date();
  const reminders: EventReminder[] = [];

  for (const event of getEvents()) {
    if (!event.isPublished || event.isCancelled || event.remindersEnabled === false) continue;

    const status = computeEventStatus(event, now);
    if (status === 'completed' || status === 'cancelled') continue;
    if (status === 'upcoming') {
      const eventDate = new Date(event.date);
      const daysAway = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAway > 7) continue;
    }

    const message =
      status === 'live'
        ? `🔴 "${event.title}" is live now`
        : status === 'today'
          ? `"${event.title}" is happening today (${formatCountdown(event, now)})`
          : `"${event.title}" starts in ${formatCountdown(event, now)}`;

    reminders.push({ eventId: event.id, title: event.title, status, message });
  }

  return reminders;
}
