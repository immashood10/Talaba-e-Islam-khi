import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!adminUsername || !adminPassword || !sessionSecret) {
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 });
  }

  const { username, password } = await request.json().catch(() => ({}));

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const token = await createSessionToken(username, sessionSecret);
  const response = NextResponse.json({ success: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
