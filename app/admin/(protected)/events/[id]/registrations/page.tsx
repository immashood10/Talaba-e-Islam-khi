'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { EventRegistration } from '@/lib/event-registration-store';
import type { EventWithMeta } from '@/lib/event-view';

export default function AdminEventRegistrationsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventWithMeta | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [eventRes, registrationsRes] = await Promise.all([
        fetch(`/api/events/${id}`),
        fetch(`/api/events/${id}/registrations`),
      ]);
      const eventData = await eventRes.json();
      const registrationsData = await registrationsRes.json();
      setEvent(eventData.event ?? null);
      setRegistrations(registrationsData.registrations ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheckedIn = async (registration: EventRegistration) => {
    await fetch(`/api/events/${id}/registrations/${registration.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: !registration.checkedIn }),
    });
    await fetchData();
  };

  const checkedInCount = registrations.filter((r) => r.checkedIn).length;

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/events" className="mb-4 inline-block text-sm font-medium text-primary hover:underline">
          ← Back to Events
        </Link>

        {isLoading ? (
          <div className="card animate-pulse">
            <div className="h-6 w-1/2 rounded bg-gray-200" />
          </div>
        ) : !event ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Event not found</h3>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-secondary mb-1">{event.title}</h1>
              <p className="text-text-light">
                {registrations.length} registered
                {event.registrationLimit != null && ` of ${event.registrationLimit}`} · {checkedInCount} checked in
              </p>
            </div>

            {registrations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-secondary mb-2">No registrations yet</h3>
                <p className="text-text-light">Registered attendees will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-soft flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-secondary truncate">{registration.memberName}</p>
                      <p className="text-sm text-text-light truncate">
                        {registration.memberEmail}
                        {registration.phone && ` · ${registration.phone}`}
                      </p>
                      <p className="text-xs text-text-light mt-1">
                        Registered {new Date(registration.registeredAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCheckedIn(registration)}
                      className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        registration.checkedIn
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'btn-secondary'
                      }`}
                    >
                      {registration.checkedIn ? '✓ Checked In' : 'Check In'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
