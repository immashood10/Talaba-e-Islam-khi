import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { setCheckedIn } from '@/lib/event-registration-store';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { registrationId } = await params;
  const { checkedIn } = await request.json().catch(() => ({}));
  if (typeof checkedIn !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const registration = setCheckedIn(registrationId, checkedIn);
  if (!registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, registration });
}
