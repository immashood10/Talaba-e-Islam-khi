import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { setEventCancelled } from '@/lib/event-store';
import { toEventWithMeta } from '@/lib/event-view';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { cancelled } = await request.json().catch(() => ({}));
  if (typeof cancelled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const event = setEventCancelled(id, cancelled);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, event: toEventWithMeta(event) });
}
