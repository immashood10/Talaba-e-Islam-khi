'use client';

import { useEffect, useState } from 'react';
import { computeEventStatus, formatCountdown, type EventStatusInput } from '@/lib/event-status';

interface EventCountdownProps {
  event: EventStatusInput;
  className?: string;
}

// Ticks every second on the client only - server renders a skeleton so
// hydration never has to reconcile a live clock against request time.
export default function EventCountdown({ event, className = '' }: EventCountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return <div className={`h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-800 ${className}`} />;
  }

  const status = computeEventStatus(event, now);
  const label = formatCountdown(event, now);

  if (status === 'live') {
    return <span className={`font-semibold text-red-600 ${className}`}>{label}</span>;
  }
  if (status === 'completed' || status === 'cancelled') {
    return <span className={`text-text-light dark:text-slate-400 ${className}`}>{label}</span>;
  }

  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-light dark:text-slate-500">Starts in</p>
      <p className="font-bold text-secondary">{label}</p>
    </div>
  );
}
