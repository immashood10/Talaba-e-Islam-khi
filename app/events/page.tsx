'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import EventCalendar from '@/components/EventCalendar';
import EventFilters, { emptyEventFilters, type EventFilterState } from '@/components/EventFilters';
import type { EventWithMeta } from '@/lib/event-view';

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState<EventFilterState>(emptyEventFilters);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setError('');
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setError('Could not load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.status !== 'all' && event.status !== filters.status) return false;
      if (filters.category && event.category !== filters.category) return false;
      if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.speaker && !event.speakers.some((s) => s.name.toLowerCase().includes(filters.speaker.toLowerCase()))) {
        return false;
      }
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const haystack = [
          event.title,
          event.subtitle,
          event.description,
          event.location,
          event.category,
          ...event.tags,
          ...event.speakers.map((s) => s.name),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [events, filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-secondary">Events</h1>
            <p className="text-lg text-text-light dark:text-slate-400">
              Browse upcoming, live, and past events from Talaba e Islam Karachi
            </p>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-slate-700">
              <button
                onClick={() => setView('list')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  view === 'list' ? 'bg-primary text-white' : 'text-text-light hover:text-secondary dark:text-slate-400'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  view === 'calendar' ? 'bg-primary text-white' : 'text-text-light hover:text-secondary dark:text-slate-400'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>

          <EventFilters value={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse p-0">
                  <div className="h-44 rounded-t-xl bg-gray-200 dark:bg-slate-800" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h3 className="mb-2 text-2xl font-bold text-secondary">Something went wrong</h3>
              <p className="mb-6 text-text-light dark:text-slate-400">{error}</p>
              <button onClick={fetchEvents} className="btn-primary">
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🗓️</div>
              <h3 className="mb-2 text-2xl font-bold text-secondary">No events found</h3>
              <p className="text-text-light dark:text-slate-400">
                {events.length === 0 ? 'Check back soon for upcoming events.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : view === 'list' ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="animate-slide-up opacity-0" style={{ animationDelay: `${index * 50}ms` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <EventCalendar events={filteredEvents} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
