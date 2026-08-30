import type { EventStatus } from '@/lib/event-status';

const styles: Record<EventStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  today: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  live: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400',
  cancelled: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-500/80',
};

const labels: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  today: 'Today',
  live: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function EventStatusBadge({ status, className = '' }: { status: EventStatus; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status]} ${className}`}
    >
      {status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />}
      {labels[status]}
    </span>
  );
}
