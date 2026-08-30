import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest } from '@/lib/auth';
import { findMemberByEmail } from '@/lib/member-store';
import { getEventById } from '@/lib/event-store';
import {
  createRegistration,
  deleteRegistration,
  findRegistration,
  getRegistrationCountForEvent,
} from '@/lib/event-registration-store';
import { computeEventStatus } from '@/lib/event-status';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Please log in to register' }, { status: 401 });
  }

  const { id } = await params;
  const event = getEventById(id);
  if (!event || !event.isPublished) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (!event.registrationRequired) {
    return NextResponse.json({ error: 'This event does not require registration' }, { status: 400 });
  }

  const status = computeEventStatus(event);
  if (status === 'cancelled' || status === 'completed') {
    return NextResponse.json({ error: 'Registration is closed for this event' }, { status: 400 });
  }

  if (findRegistration(id, memberEmail)) {
    return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
  }

  if (event.registrationLimit != null) {
    const currentCount = getRegistrationCountForEvent(id);
    if (currentCount >= event.registrationLimit) {
      return NextResponse.json({ error: 'This event is fully booked' }, { status: 400 });
    }
  }

  const member = findMemberByEmail(memberEmail);
  const registration = createRegistration({
    eventId: id,
    memberEmail,
    memberName: member?.name || 'Member',
    phone: member?.phone,
  });

  return NextResponse.json({ success: true, registration }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteRegistration(id, memberEmail);
  if (!deleted) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
