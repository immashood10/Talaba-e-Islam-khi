import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { createEvent, getEvents, getPublishedEvents } from '@/lib/event-store';
import { validateEventInput } from '@/lib/validate-event';
import { toEventWithMeta } from '@/lib/event-view';

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  const events = isAdmin ? getEvents() : getPublishedEvents();
  return NextResponse.json({ events: events.map(toEventWithMeta) });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const result = validateEventInput(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const event = createEvent(result.data);
  return NextResponse.json({ success: true, event: toEventWithMeta(event) }, { status: 201 });
}
