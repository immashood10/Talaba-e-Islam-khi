import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getEvents } from '@/lib/event-store';
import { getAllRegistrations } from '@/lib/event-registration-store';
import { computeEventStatus } from '@/lib/event-status';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const events = getEvents();
  const registrations = getAllRegistrations();

  const counts = { upcoming: 0, today: 0, live: 0, completed: 0, cancelled: 0 };
  for (const event of events) {
    counts[computeEventStatus(event)] += 1;
  }

  const registrationsByEvent = new Map<string, number>();
  for (const registration of registrations) {
    registrationsByEvent.set(registration.eventId, (registrationsByEvent.get(registration.eventId) ?? 0) + 1);
  }

  let mostPopularEvent: { id: string; title: string; registrationCount: number } | null = null;
  for (const [eventId, count] of registrationsByEvent) {
    if (!mostPopularEvent || count > mostPopularEvent.registrationCount) {
      const event = events.find((e) => e.id === eventId);
      if (event) mostPopularEvent = { id: event.id, title: event.title, registrationCount: count };
    }
  }

  return NextResponse.json({
    ...counts,
    totalRegistrations: registrations.length,
    mostPopularEvent,
  });
}
