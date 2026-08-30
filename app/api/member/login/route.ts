import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE, createSessionToken } from '@/lib/auth';
import { findMemberByEmail, toPublicMember, verifyPassword } from '@/lib/member-store';

export async function POST(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return NextResponse.json({ error: 'Membership login is not configured' }, { status: 500 });
  }

  const { email, password } = await request.json().catch(() => ({}));

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const member = findMemberByEmail(email);
  if (!member || !member.salt || !member.hash || !verifyPassword(password, member.salt, member.hash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await createSessionToken(member.email, sessionSecret);
  // Included for the mobile app, which has no cookie jar and authenticates
  // with this token via an Authorization: Bearer header instead.
  const response = NextResponse.json({ success: true, member: toPublicMember(member), token });

  response.cookies.set(MEMBER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
