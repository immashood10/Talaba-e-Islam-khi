import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE, createSessionToken } from '@/lib/auth';
import { findOrCreateOAuthMember } from '@/lib/member-store';
import { OAUTH_STATE_COOKIE, oauthRedirectUri } from '@/lib/oauth';

interface FacebookTokenResponse {
  access_token?: string;
  error?: unknown;
}

interface FacebookProfile {
  id?: string;
  name?: string;
  email?: string;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
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
    const redirectUri = oauthRedirectUri(request.nextUrl.origin, 'facebook');
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl);
    const tokenData = (await tokenRes.json()) as FacebookTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) return failure;

    const profileUrl = new URL('https://graph.facebook.com/me');
    profileUrl.searchParams.set('fields', 'id,name,email');
    profileUrl.searchParams.set('access_token', tokenData.access_token);

    const profileRes = await fetch(profileUrl);
    const profile = (await profileRes.json()) as FacebookProfile;

    if (!profileRes.ok || !profile.email) return failure;

    const member = findOrCreateOAuthMember({
      name: profile.name || profile.email,
      email: profile.email,
      provider: 'facebook',
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
