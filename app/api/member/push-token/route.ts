import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest } from '@/lib/auth';
import { registerPushToken, unregisterPushToken } from '@/lib/push-token-store';

export async function POST(request: NextRequest) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, platform } = await request.json().catch(() => ({}));

  if (typeof token !== 'string' || !token.trim()) {
    return NextResponse.json({ error: 'Missing push token' }, { status: 400 });
  }
  if (platform !== 'ios' && platform !== 'android' && platform !== 'web') {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  registerPushToken({ memberEmail, token: token.trim(), platform });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await request.json().catch(() => ({}));
  if (typeof token !== 'string' || !token.trim()) {
    return NextResponse.json({ error: 'Missing push token' }, { status: 400 });
  }

  unregisterPushToken(token.trim());
  return NextResponse.json({ success: true });
}
