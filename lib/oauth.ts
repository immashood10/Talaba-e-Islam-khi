// Shared bits for the Google/Facebook "Continue with..." login flow.
// The state cookie guards against CSRF: we set a random value before
// redirecting to the provider and check the callback's `state` query param
// against it.

export const OAUTH_STATE_COOKIE = 'oauth_state';

export function oauthRedirectUri(origin: string, provider: 'google' | 'facebook'): string {
  return `${origin}/api/auth/${provider}/callback`;
}
