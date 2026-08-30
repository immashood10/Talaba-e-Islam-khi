import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE, createSessionToken, getMemberEmailFromRequest } from '@/lib/auth';
import { deleteMember, findMemberByEmail, isEmailTaken, toPublicMember, updateMemberProfile } from '@/lib/member-store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return NextResponse.json({ error: 'Account settings are not configured' }, { status: 500 });
  }

  const currentEmail = await getMemberEmailFromRequest(request);
  const currentMember = currentEmail ? findMemberByEmail(currentEmail) : undefined;
  if (!currentMember) {
    return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
  }

  const { name, email, phone } = await request.json().catch(() => ({}));

  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (isEmailTaken(normalizedEmail, currentMember.id)) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const updated = updateMemberProfile(currentMember.id, {
    name: name.trim(),
    email: normalizedEmail,
    phone: typeof phone === 'string' && phone.trim() ? phone.trim() : undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: 'Could not update your account' }, { status: 500 });
  }

  const token = await createSessionToken(updated.email, sessionSecret);
  // Included for the mobile app: if the email changed, its previously
  // stored bearer token is now stale and must be replaced with this one.
  const response = NextResponse.json({ success: true, member: toPublicMember(updated), token });

  response.cookies.set(MEMBER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function DELETE(request: NextRequest) {
  const email = await getMemberEmailFromRequest(request);
  const member = email ? findMemberByEmail(email) : undefined;
  if (!member) {
    return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
  }

  deleteMember(member.id);

  const response = NextResponse.json({ success: true });
  response.cookies.delete(MEMBER_SESSION_COOKIE);
  return response;
}
