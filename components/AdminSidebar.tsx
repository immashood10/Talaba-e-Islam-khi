'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AdminNotification } from '@/lib/notification-store';
import type { EventReminder } from '@/lib/event-view';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: GridIcon },
  { href: '/admin/live', label: 'Live', Icon: BroadcastIcon },
  { href: '/admin/broadcast', label: 'Broadcast', Icon: CameraIcon },
  { href: '/admin/shop', label: 'Shop', Icon: ShopIcon },
  { href: '/admin/events', label: 'Events', Icon: CalendarIcon },
  { href: '/admin/ads', label: 'Ads', Icon: AdIcon },
  { href: '/admin/stories', label: 'Stories', Icon: StoryIcon },
];

function GridIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BroadcastIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="2.5" />
      <path strokeLinecap="round" d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.5 5.5a9 9 0 000 13M18.5 5.5a9 9 0 010 13" />
    </svg>
  );
}

function CameraIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8a2 2 0 012-2h1.5l1-1.5h7l1 1.5H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function ShopIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 13a2 2 0 004 0M12 13a2 2 0 004 0" />
    </svg>
  );
}

function CalendarIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}

function AdIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h4M7 13h7" />
      <circle cx="17" cy="14" r="2" />
    </svg>
  );
}

function StoryIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8v8l7-4-7-4z" />
    </svg>
  );
}

function LogoutIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function BellIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [eventReminders, setEventReminders] = useState<EventReminder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setEventReminders(data.eventReminders ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // ignore transient fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const handleToggleNotifications = async () => {
    const opening = !isNotificationsOpen;
    setIsNotificationsOpen(opening);
    if (opening && unreadCount > 0) {
      setUnreadCount(0);
      await fetch('/api/admin/notifications', { method: 'PATCH' });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-gray-100 bg-white flex flex-col">
      <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xl font-bold text-secondary">Admin Panel</span>

        <div ref={notificationsRef} className="relative">
          <button
            onClick={handleToggleNotifications}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-light transition-colors hover:bg-gray-50 hover:text-secondary"
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount + eventReminders.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount + eventReminders.length > 9 ? '9+' : unreadCount + eventReminders.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 max-h-96 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-soft-lg animate-fade-in">
              {eventReminders.length > 0 && (
                <>
                  <div className="border-b border-gray-100 px-4 py-3">
                    <span className="text-sm font-semibold text-secondary">Event Reminders</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {eventReminders.map((r) => (
                      <Link
                        key={r.eventId}
                        href={`/events/${r.eventId}`}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        <p className={`text-sm ${r.status === 'live' ? 'font-semibold text-red-600' : 'text-secondary'}`}>{r.message}</p>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <div className="border-b border-gray-100 px-4 py-3">
                <span className="text-sm font-semibold text-secondary">Notifications</span>
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-text-light">No notifications yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3">
                      <p className="text-sm text-secondary">{n.message}</p>
                      <p className="mt-1 text-xs text-text-light">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-light hover:bg-gray-50 hover:text-secondary'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-light transition-colors hover:bg-gray-50 hover:text-red-500 disabled:opacity-60"
        >
          <LogoutIcon className="h-5 w-5" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
