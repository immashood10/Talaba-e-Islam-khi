import Link from 'next/link';
import EventStatusBadge from './EventStatusBadge';
import EventCountdown from './EventCountdown';
import type { EventWithMeta } from '@/lib/event-view';

export default function EventCard({ event }: { event: EventWithMeta }) {
  const image = event.thumbnail || event.bannerImage;

  return (
    <Link
      href={`/events/${event.id}`}
      className="card group flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-slate-800">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🗓️</div>
        )}
        <div className="absolute top-3 left-3">
          <EventStatusBadge status={event.status} />
        </div>
        {event.category && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            {event.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 line-clamp-2 text-lg font-bold text-secondary transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        <p className="mb-2 text-sm text-text-light dark:text-slate-400">
          {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          {event.startTime && ` · ${event.startTime}`} · {event.location}
        </p>
        <p className="line-clamp-2 flex-1 text-sm text-text-light dark:text-slate-400">{event.description}</p>

        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-slate-800">
          <EventCountdown event={event} />
        </div>
      </div>
    </Link>
  );
}
