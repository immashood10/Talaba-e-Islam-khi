// Persists mobile push notification tokens (Expo push tokens) to disk,
// following the same pattern as lib/order-store.ts. Server-only.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface PushToken {
  id: string;
  memberEmail: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'push-tokens.json');

function readTokens(): PushToken[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as PushToken[];
  } catch {
    return [];
  }
}

function writeTokens(tokens: PushToken[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function registerPushToken(input: { memberEmail: string; token: string; platform: PushToken['platform'] }): PushToken {
  const tokens = readTokens();
  const existing = tokens.find((t) => t.token === input.token);

  if (existing) {
    existing.memberEmail = input.memberEmail;
    existing.platform = input.platform;
    writeTokens(tokens);
    return existing;
  }

  const record: PushToken = {
    id: randomUUID(),
    memberEmail: input.memberEmail,
    token: input.token,
    platform: input.platform,
    createdAt: new Date().toISOString(),
  };
  tokens.push(record);
  writeTokens(tokens);
  return record;
}

export function unregisterPushToken(token: string): boolean {
  const tokens = readTokens();
  const next = tokens.filter((t) => t.token !== token);
  if (next.length === tokens.length) return false;
  writeTokens(next);
  return true;
}

export function getPushTokensForMembers(memberEmails: string[]): string[] {
  const set = new Set(memberEmails);
  return readTokens()
    .filter((t) => set.has(t.memberEmail))
    .map((t) => t.token);
}

export function getAllPushTokens(): string[] {
  return readTokens().map((t) => t.token);
}
