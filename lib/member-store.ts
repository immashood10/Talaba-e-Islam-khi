// Persists member accounts to disk, following the same pattern as
// lib/live-store.ts. Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';

export type MemberProvider = 'local' | 'google' | 'facebook';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // Absent for members who have only ever signed in via Google/Facebook.
  salt?: string;
  hash?: string;
  provider: MemberProvider;
  createdAt: string;
}

export interface PublicMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  hasPassword: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'members.json');

function readMembers(): Member[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as Member[];
  } catch {
    return [];
  }
}

function writeMembers(members: Member[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(members, null, 2), 'utf-8');
}

export function findMemberByEmail(email: string): Member | undefined {
  const normalized = email.trim().toLowerCase();
  return readMembers().find((m) => m.email === normalized);
}

export function createMember(input: {
  name: string;
  email: string;
  phone?: string;
  salt?: string;
  hash?: string;
  provider: MemberProvider;
}): Member {
  const members = readMembers();
  const member: Member = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone,
    salt: input.salt,
    hash: input.hash,
    provider: input.provider,
    createdAt: new Date().toISOString(),
  };
  members.push(member);
  writeMembers(members);
  return member;
}

// Logs an OAuth user into their existing account (matched by email) or
// creates a new password-less member for them.
export function findOrCreateOAuthMember(input: { name: string; email: string; provider: 'google' | 'facebook' }): Member {
  const existing = findMemberByEmail(input.email);
  if (existing) return existing;

  return createMember({
    name: input.name,
    email: input.email.trim().toLowerCase(),
    provider: input.provider,
  });
}

export function isEmailTaken(email: string, excludeMemberId: string): boolean {
  const normalized = email.trim().toLowerCase();
  return readMembers().some((m) => m.id !== excludeMemberId && m.email === normalized);
}

export function updateMemberProfile(
  memberId: string,
  updates: { name: string; email: string; phone?: string },
): Member | null {
  const members = readMembers();
  const index = members.findIndex((m) => m.id === memberId);
  if (index === -1) return null;

  members[index] = {
    ...members[index],
    name: updates.name,
    email: updates.email.trim().toLowerCase(),
    phone: updates.phone,
  };
  writeMembers(members);
  return members[index];
}

export function deleteMember(memberId: string): boolean {
  const members = readMembers();
  const next = members.filter((m) => m.id !== memberId);
  if (next.length === members.length) return false;
  writeMembers(next);
  return true;
}

export function updateMemberPassword(memberId: string, salt: string, hash: string): Member | null {
  const members = readMembers();
  const index = members.findIndex((m) => m.id === memberId);
  if (index === -1) return null;

  members[index] = { ...members[index], salt, hash };
  writeMembers(members);
  return members[index];
}

export function toPublicMember(member: Member): PublicMember {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    hasPassword: Boolean(member.salt && member.hash),
  };
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, 'hex');
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}
