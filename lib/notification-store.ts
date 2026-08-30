// Persists admin-facing notifications to disk, following the same pattern as lib/order-store.ts.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface AdminNotification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'notifications.json');

function readNotifications(): AdminNotification[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as AdminNotification[];
  } catch {
    return [];
  }
}

function writeNotifications(notifications: AdminNotification[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(notifications, null, 2), 'utf-8');
}

export function getNotifications(): AdminNotification[] {
  return readNotifications().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadNotificationCount(): number {
  return readNotifications().filter((n) => !n.isRead).length;
}

export function createNotification(message: string): AdminNotification {
  const notifications = readNotifications();
  const notification: AdminNotification = {
    id: randomUUID(),
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notification);
  writeNotifications(notifications);
  return notification;
}

export function markAllNotificationsRead(): void {
  const notifications = readNotifications().map((n) => ({ ...n, isRead: true }));
  writeNotifications(notifications);
}
