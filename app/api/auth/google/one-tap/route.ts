import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE, createSessionToken } from '@/lib/auth';
import { findOrCreateOAuthMember, toPublicMember } from '@/lib/member-store';

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string;
  name?: string;
}

// Verifies a Google One Tap ID token (see lib/google-one-tap.ts) the same
// way the redirect-based "Continue with Google" flow verifies its code
// exchange in app/api/auth/google/callback/route.ts - just via Google's
// tokeninfo endpoint instead of a full authorization-code round trip, since
// the browser already did the sign-in.
export async function POST(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!clientId || !sessionSecret) {
    return NextResponse.json({ error: 'Google login is not configured' }, { status: 500 });
  }

  const { credential } = await request.json().catch(() => ({}));
  if (typeof credential !== 'string' || !credential) {
    return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
  }

  const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!infoRes.ok) {
    return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
  }
  const info = (await infoRes.json()) as GoogleTokenInfo;

  if (info.aud !== clientId || info.email_verified !== 'true' || !info.email) {
    return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
  }

  const member = findOrCreateOAuthMember({
    name: info.name || info.email,
    email: info.email,
    provider: 'google',
  });

  const token = await createSessionToken(member.email, sessionSecret);
  const response = NextResponse.json({ success: true, member: toPublicMember(member) });
  response.cookies.set(MEMBER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
