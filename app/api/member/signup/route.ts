import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE, createSessionToken } from '@/lib/auth';
import { createMember, findMemberByEmail, hashPassword, toPublicMember } from '@/lib/member-store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return NextResponse.json({ error: 'Membership signup is not configured' }, { status: 500 });
  }

  const { name, email, phone, password } = await request.json().catch(() => ({}));

  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }
  if (typeof phone !== 'string' || phone.trim().length < 7) {
    return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (findMemberByEmail(normalizedEmail)) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const { salt, hash } = hashPassword(password);
  const member = createMember({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    salt,
    hash,
    provider: 'local',
  });

  const token = await createSessionToken(member.email, sessionSecret);
  // Included for the mobile app, which has no cookie jar and authenticates
  // with this token via an Authorization: Bearer header instead.
  const response = NextResponse.json({ success: true, member: toPublicMember(member), token }, { status: 201 });

  response.cookies.set(MEMBER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
