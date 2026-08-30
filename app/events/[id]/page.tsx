'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventStatusBadge from '@/components/EventStatusBadge';
import EventCountdown from '@/components/EventCountdown';
import EventCard from '@/components/EventCard';
import MembershipModal from '@/components/MembershipModal';
import { useMember } from '@/lib/member-context';
import type { EventWithMeta } from '@/lib/event-view';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toIcsDate(date: string, time?: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = (time || '00:00').split(':').map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(min)}00`;
}

function buildIcsContent(event: EventWithMeta): string {
  const start = toIcsDate(event.date, event.startTime);
  const end = toIcsDate(event.date, event.endTime || event.startTime);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${event.id}@talabaeislamkarachi`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replace(/\r?\n/g, ' ')}`,
    `DESCRIPTION:${event.description.replace(/\r?\n/g, '\\n')}`,
    `LOCATION:${event.location.replace(/\r?\n/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { member } = useMember();

  const [event, setEvent] = useState<EventWithMeta | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<EventWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (member) checkRegistration();
    else setIsRegistered(false);
  }, [member, id]);

  const fetchEvent = async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setEvent(data.event);

      const listRes = await fetch('/api/events');
      const listData = await listRes.json();
      const related = ((listData.events ?? []) as EventWithMeta[])
        .filter((e) => e.id !== id && e.category === data.event.category)
        .slice(0, 3);
      setRelatedEvents(related);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const res = await fetch('/api/events/mine');
      if (!res.ok) return;
      const data = await res.json();
      setIsRegistered((data.items ?? []).some((item: { event: EventWithMeta }) => item.event.id === id));
    } catch {
      // ignore
    }
  };

  const handleRegister = async () => {
    if (!member) {
      setIsMemberModalOpen(true);
      return;
    }
    setRegistrationError('');
    setIsRegistering(true);
    try {
      const res = await fetch(`/api/events/${id}/register`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRegistrationError(data.error || 'Could not register for this event');
        return;
      }
      setIsRegistered(true);
      await fetchEvent();
    } catch {
      setRegistrationError('Something went wrong. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setRegistrationError('');
    setIsRegistering(true);
    try {
      const res = await fetch(`/api/events/${id}/register`, { method: 'DELETE' });
      if (!res.ok) {
        setRegistrationError('Could not cancel your registration');
        return;
      }
      setIsRegistered(false);
      await fetchEvent();
    } catch {
      setRegistrationError('Something went wrong. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const content = buildIcsContent(event);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^\w\- ]/g, '')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!event) return;
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: event.title, text: event.subtitle || event.description, url });
      } catch {
        // user cancelled share sheet - no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const registrationClosed = useMemo(() => {
    if (!event) return true;
    return event.status === 'completed' || event.status === 'cancelled';
  }, [event]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-background py-8 dark:bg-slate-950">
          <div className="mx-auto max-w-5xl animate-pulse px-4 sm:px-6 lg:px-8">
            <div className="mb-6 h-64 rounded-2xl bg-gray-200 dark:bg-slate-800" />
            <div className="mb-3 h-8 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-slate-800" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-background py-16 dark:bg-slate-950">
          <div className="text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h1 className="mb-2 text-3xl font-bold text-secondary">Event not found</h1>
            <p className="mb-6 text-text-light dark:text-slate-400">This event may have been removed or unpublished.</p>
            <Link href="/events" className="btn-primary">
              Browse Events
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background dark:bg-slate-950">
        {/* Banner */}
        <div className="relative h-64 w-full overflow-hidden bg-gray-200 sm:h-80 dark:bg-slate-800">
          {event.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL
            <img src={event.bannerImage} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">🗓️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <EventStatusBadge status={event.status} />
                {event.category && (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {event.category}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{event.title}</h1>
              {event.subtitle && <p className="mt-1 text-lg text-white/90">{event.subtitle}</p>}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {event.status === 'live' && event.liveStreamEnabled && event.liveStreamUrl && (
            <a
              href={event.liveStreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-8 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" /> Watch Live Now
            </a>
          )}

          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              {/* Description */}
              <section>
                <h2 className="mb-3 text-2xl font-bold text-secondary">About This Event</h2>
                <p className="whitespace-pre-line leading-relaxed text-text-light dark:text-slate-400">{event.description}</p>
                {event.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Speakers */}
              {event.speakers.length > 0 && (
                <section>
                  <h2 className="mb-3 text-2xl font-bold text-secondary">Speakers</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {event.speakers.map((speaker, i) => (
                      <div key={i} className="card flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                          {speaker.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-secondary">{speaker.name}</p>
                          {speaker.title && <p className="text-sm text-text-light dark:text-slate-400">{speaker.title}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {event.gallery.length > 0 && (
                <section>
                  <h2 className="mb-3 text-2xl font-bold text-secondary">Event Gallery</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {event.gallery.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL
                      <img key={i} src={src} alt={`${event.title} gallery ${i + 1}`} className="aspect-square rounded-lg object-cover" />
                    ))}
                  </div>
                </section>
              )}

              {/* Documents */}
              {event.documents.length > 0 && (
                <section>
                  <h2 className="mb-3 text-2xl font-bold text-secondary">Documents</h2>
                  <div className="space-y-2">
                    {event.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card flex items-center gap-3 hover:-translate-y-0.5"
                      >
                        <span className="text-2xl">📄</span>
                        <span className="font-medium text-secondary">{doc.name}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card">
                <EventCountdown event={event} className="mb-4" />

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-secondary">Date</dt>
                    <dd className="text-text-light dark:text-slate-400">
                      {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </dd>
                  </div>
                  {(event.startTime || event.endTime) && (
                    <div>
                      <dt className="font-medium text-secondary">Time</dt>
                      <dd className="text-text-light dark:text-slate-400">
                        {event.startTime}
                        {event.endTime && ` - ${event.endTime}`} ({event.timeZone})
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-secondary">Venue</dt>
                    <dd className="text-text-light dark:text-slate-400">{event.location}</dd>
                    {event.mapsLink && (
                      <a
                        href={event.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
                      >
                        View on Google Maps →
                      </a>
                    )}
                  </div>
                  <div>
                    <dt className="font-medium text-secondary">Organizer</dt>
                    <dd className="text-text-light dark:text-slate-400">{event.organizer}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex gap-2">
                  <button onClick={handleAddToCalendar} className="btn-secondary flex-1 px-3 py-2 text-sm">
                    Add to Calendar
                  </button>
                  <button onClick={handleShare} className="btn-secondary flex-1 px-3 py-2 text-sm">
                    {shareCopied ? 'Link Copied ✓' : 'Share'}
                  </button>
                </div>
              </div>

              {event.registrationRequired && (
                <div className="card">
                  <h3 className="mb-2 text-lg font-bold text-secondary">Registration</h3>
                  <p className="mb-4 text-sm text-text-light dark:text-slate-400">
                    {event.remainingSeats === null
                      ? `${event.registrationCount} registered`
                      : event.remainingSeats > 0
                        ? `${event.remainingSeats} seats remaining of ${event.registrationLimit}`
                        : 'This event is fully booked'}
                  </p>

                  {registrationError && <p className="mb-3 text-sm text-red-500">{registrationError}</p>}

                  {registrationClosed ? (
                    <p className="text-sm text-text-light dark:text-slate-400">Registration is closed for this event.</p>
                  ) : isRegistered ? (
                    <button
                      onClick={handleUnregister}
                      disabled={isRegistering}
                      className="w-full rounded-lg border-2 border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      {isRegistering ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || (event.remainingSeats !== null && event.remainingSeats <= 0)}
                      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRegistering ? 'Registering...' : 'Register Now'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-secondary">Related Events</h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedEvents.map((related) => (
                  <EventCard key={related.id} event={related} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      <MembershipModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} />
    </div>
  );
}
