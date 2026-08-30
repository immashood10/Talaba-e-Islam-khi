'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { EventWithMeta } from '@/lib/event-view';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EventCalendar({ events }: { events: EventWithMeta[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventWithMeta[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = new Date().toISOString().slice(0, 10);

  const cells: (string | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }),
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="btn-secondary px-3 py-1.5 text-sm"
          aria-label="Previous month"
        >
          ‹ Prev
        </button>
        <h3 className="text-lg font-bold text-secondary">
          {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="btn-secondary px-3 py-1.5 text-sm"
          aria-label="Next month"
        >
          Next ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-text-light dark:text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateKey, i) => {
          if (!dateKey) return <div key={`empty-${i}`} />;
          const dayEvents = eventsByDay.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              className={`min-h-[5rem] rounded-lg border p-1.5 text-left ${
                isToday ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-slate-800'
              }`}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-text-light dark:text-slate-400'}`}>
                {Number(dateKey.slice(-2))}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20"
                  >
                    {event.title}
                  </Link>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-text-light dark:text-slate-500">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
