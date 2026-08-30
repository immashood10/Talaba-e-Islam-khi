// Persists event registrations to disk, following the same pattern as lib/order-store.ts.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface EventRegistration {
  id: string;
  eventId: string;
  memberEmail: string;
  memberName: string;
  phone?: string;
  checkedIn: boolean;
  registeredAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'event-registrations.json');

function readRegistrations(): EventRegistration[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as EventRegistration[];
  } catch {
    return [];
  }
}

function writeRegistrations(registrations: EventRegistration[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(registrations, null, 2), 'utf-8');
}

export function getRegistrationsForEvent(eventId: string): EventRegistration[] {
  return readRegistrations()
    .filter((r) => r.eventId === eventId)
    .sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
}

export function getRegistrationCountForEvent(eventId: string): number {
  return readRegistrations().filter((r) => r.eventId === eventId).length;
}

export function getRegistrationsForMember(memberEmail: string): EventRegistration[] {
  return readRegistrations()
    .filter((r) => r.memberEmail === memberEmail)
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}

export function findRegistration(eventId: string, memberEmail: string): EventRegistration | undefined {
  return readRegistrations().find((r) => r.eventId === eventId && r.memberEmail === memberEmail);
}

export function createRegistration(input: {
  eventId: string;
  memberEmail: string;
  memberName: string;
  phone?: string;
}): EventRegistration {
  const registrations = readRegistrations();
  const registration: EventRegistration = {
    id: randomUUID(),
    eventId: input.eventId,
    memberEmail: input.memberEmail,
    memberName: input.memberName,
    phone: input.phone,
    checkedIn: false,
    registeredAt: new Date().toISOString(),
  };
  registrations.push(registration);
  writeRegistrations(registrations);
  return registration;
}

export function deleteRegistration(eventId: string, memberEmail: string): boolean {
  const registrations = readRegistrations();
  const next = registrations.filter((r) => !(r.eventId === eventId && r.memberEmail === memberEmail));
  if (next.length === registrations.length) return false;
  writeRegistrations(next);
  return true;
}

export function setCheckedIn(registrationId: string, checkedIn: boolean): EventRegistration | null {
  const registrations = readRegistrations();
  const index = registrations.findIndex((r) => r.id === registrationId);
  if (index === -1) return null;

  registrations[index] = { ...registrations[index], checkedIn };
  writeRegistrations(registrations);
  return registrations[index];
}

export function getAllRegistrations(): EventRegistration[] {
  return readRegistrations();
}
