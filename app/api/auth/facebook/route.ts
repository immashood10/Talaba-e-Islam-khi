import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { OAUTH_STATE_COOKIE, oauthRedirectUri } from '@/lib/oauth';

export async function GET(request: NextRequest) {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Facebook login is not configured' }, { status: 500 });
  }

  const state = randomUUID();
  const authorizeUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', oauthRedirectUri(request.nextUrl.origin, 'facebook'));
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'email,public_profile');
  authorizeUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}
