'use client';

import { EVENT_CATEGORIES } from '@/lib/event-status';

export type EventStatusFilter = 'all' | 'live' | 'today' | 'upcoming' | 'completed' | 'cancelled';

export interface EventFilterState {
  keyword: string;
  category: string;
  location: string;
  speaker: string;
  status: EventStatusFilter;
}

export const emptyEventFilters: EventFilterState = {
  keyword: '',
  category: '',
  location: '',
  speaker: '',
  status: 'all',
};

interface EventFiltersProps {
  value: EventFilterState;
  onChange: (patch: Partial<EventFilterState>) => void;
}

export default function EventFilters({ value, onChange }: EventFiltersProps) {
  return (
    <div className="card mb-8 space-y-4">
      <div>
        <label htmlFor="event-search" className="mb-1.5 block text-xs font-medium text-text-light dark:text-slate-400">
          Search
        </label>
        <input
          id="event-search"
          type="text"
          value={value.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder="Search by title, tag, or speaker..."
          className="input-field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="event-category" className="mb-1.5 block text-xs font-medium text-text-light dark:text-slate-400">
            Category
          </label>
          <select
            id="event-category"
            value={value.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="input-field"
          >
            <option value="">All Categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="event-location" className="mb-1.5 block text-xs font-medium text-text-light dark:text-slate-400">
            Location
          </label>
          <input
            id="event-location"
            type="text"
            value={value.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g., Muslim Town"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="event-speaker" className="mb-1.5 block text-xs font-medium text-text-light dark:text-slate-400">
            Speaker
          </label>
          <input
            id="event-speaker"
            type="text"
            value={value.speaker}
            onChange={(e) => onChange({ speaker: e.target.value })}
            placeholder="Speaker name"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="event-status" className="mb-1.5 block text-xs font-medium text-text-light dark:text-slate-400">
            Status
          </label>
          <select
            id="event-status"
            value={value.status}
            onChange={(e) => onChange({ status: e.target.value as EventStatusFilter })}
            className="input-field"
          >
            <option value="all">All</option>
            <option value="live">Live</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
}
