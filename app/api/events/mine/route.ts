import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest } from '@/lib/auth';
import { getRegistrationsForMember } from '@/lib/event-registration-store';
import { getEventById } from '@/lib/event-store';
import { toEventWithMeta } from '@/lib/event-view';

export async function GET(request: NextRequest) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const registrations = getRegistrationsForMember(memberEmail);
  const items = registrations
    .map((registration) => {
      const event = getEventById(registration.eventId);
      if (!event) return null;
      return { registration, event: toEventWithMeta(event) };
    })
    .filter((item): item is { registration: (typeof registrations)[number]; event: ReturnType<typeof toEventWithMeta> } => item !== null);

  return NextResponse.json({ items });
}
