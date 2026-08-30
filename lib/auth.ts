// Signed session tokens for the admin dashboard, built on Web Crypto so the
// same code runs in both the Edge middleware and Node route handlers.

import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const MEMBER_SESSION_COOKIE = 'member_session';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createSessionToken(username: string, secret: string): Promise<string> {
  const payload = JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  return `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`;
}

// Returns the signed-in subject (the value passed to createSessionToken) if
// the token is valid and unexpired, otherwise null.
export async function getSessionSubject(token: string | undefined, secret: string): Promise<string | null> {
  if (!token || !secret) return null;

  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getKey(secret);
    const isValid = await crypto.subtle.verify('HMAC', key, fromBase64Url(sigB64) as BufferSource, encoder.encode(payloadB64));
    if (!isValid) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64))) as { u?: string; exp?: number };
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null;
    return payload.u ?? null;
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  return (await getSessionSubject(token, secret)) !== null;
}

// The website authenticates via httpOnly cookies. The mobile app has no
// cookie jar, so it sends the same signed token in an Authorization: Bearer
// header instead - this accepts either, without adding a second auth system.
function getBearerToken(request: NextRequest): string | undefined {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length).trim();
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? getBearerToken(request);
  return verifySessionToken(token, process.env.SESSION_SECRET ?? '');
}

export async function getMemberEmailFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(MEMBER_SESSION_COOKIE)?.value ?? getBearerToken(request);
  return getSessionSubject(token, process.env.SESSION_SECRET ?? '');
}
