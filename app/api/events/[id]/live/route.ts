import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getEventById, setEventLive } from '@/lib/event-store';
import { toEventWithMeta } from '@/lib/event-view';
import { getRegistrationsForEvent } from '@/lib/event-registration-store';
import { getPushTokensForMembers } from '@/lib/push-token-store';
import { sendPushNotification } from '@/lib/push';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { live } = await request.json().catch(() => ({}));
  if (typeof live !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const existing = getEventById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (live && !existing.liveStreamEnabled) {
    return NextResponse.json({ error: 'Enable live streaming for this event first' }, { status: 400 });
  }
  if (live && existing.isCancelled) {
    return NextResponse.json({ error: 'Cannot go live on a cancelled event' }, { status: 400 });
  }

  const event = setEventLive(id, live);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (live) {
    const registrations = getRegistrationsForEvent(id);
    const tokens = getPushTokensForMembers(registrations.map((r) => r.memberEmail));
    void sendPushNotification(tokens, {
      title: `🔴 ${event.title} is live now`,
      body: 'Tap to watch the live stream.',
      data: { type: 'live', eventId: event.id },
    });
  }

  return NextResponse.json({ success: true, event: toEventWithMeta(event) });
}
