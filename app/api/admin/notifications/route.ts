import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getNotifications, getUnreadNotificationCount, markAllNotificationsRead } from '@/lib/notification-store';
import { getEventReminders } from '@/lib/event-view';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    notifications: getNotifications(),
    unreadCount: getUnreadNotificationCount(),
    eventReminders: getEventReminders(),
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  markAllNotificationsRead();
  return NextResponse.json({ success: true });
}
