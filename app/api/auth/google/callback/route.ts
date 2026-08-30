import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE, createSessionToken } from '@/lib/auth';
import { findOrCreateOAuthMember } from '@/lib/member-store';
import { OAUTH_STATE_COOKIE, oauthRedirectUri } from '@/lib/oauth';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  const home = new URL('/', request.nextUrl.origin);

  if (!clientId || !clientSecret || !sessionSecret) {
    return NextResponse.redirect(home);
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  const failure = NextResponse.redirect(home);
  failure.cookies.delete(OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return failure;
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: oauthRedirectUri(request.nextUrl.origin, 'google'),
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) return failure;

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await profileRes.json()) as GoogleUserInfo;

    if (!profileRes.ok || !profile.email || !profile.email_verified) return failure;

    const member = findOrCreateOAuthMember({
      name: profile.name || profile.email,
      email: profile.email,
      provider: 'google',
    });

    const token = await createSessionToken(member.email, sessionSecret);
    const response = NextResponse.redirect(home);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.set(MEMBER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return failure;
  }
}
