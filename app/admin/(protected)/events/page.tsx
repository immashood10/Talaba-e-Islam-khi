'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { EventWithMeta } from '@/lib/event-view';
import { EVENT_CATEGORIES } from '@/lib/event-status';

const LocationMapPicker = dynamic(() => import('@/components/LocationMapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-gray-100" />,
});

interface SpeakerRow {
  name: string;
  title: string;
}

interface DocumentRow {
  name: string;
  url: string;
}

interface EventFormState {
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  thumbnail: string;
  date: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  location: string;
  mapsLink: string;
  category: string;
  speakers: SpeakerRow[];
  organizer: string;
  registrationRequired: boolean;
  registrationLimit: string;
  isFeatured: boolean;
  liveStreamEnabled: boolean;
  liveStreamUrl: string;
  remindersEnabled: boolean;
  gallery: string[];
  documents: DocumentRow[];
  tags: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const emptyForm: EventFormState = {
  title: '',
  subtitle: '',
  description: '',
  bannerImage: '',
  thumbnail: '',
  date: '',
  startTime: '',
  endTime: '',
  timeZone: 'Asia/Karachi',
  location: '',
  mapsLink: '',
  category: EVENT_CATEGORIES[0],
  speakers: [],
  organizer: 'Talaba e Islam Karachi',
  registrationRequired: false,
  registrationLimit: '',
  isFeatured: false,
  liveStreamEnabled: false,
  liveStreamUrl: '',
  remindersEnabled: true,
  gallery: [],
  documents: [],
  tags: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

function eventToForm(event: EventWithMeta): EventFormState {
  return {
    title: event.title,
    subtitle: event.subtitle || '',
    description: event.description,
    bannerImage: event.bannerImage || '',
    thumbnail: event.thumbnail || '',
    date: event.date,
    startTime: event.startTime || '',
    endTime: event.endTime || '',
    timeZone: event.timeZone,
    location: event.location,
    mapsLink: event.mapsLink || '',
    category: event.category,
    speakers: event.speakers.map((s) => ({ name: s.name, title: s.title || '' })),
    organizer: event.organizer,
    registrationRequired: event.registrationRequired,
    registrationLimit: event.registrationLimit != null ? String(event.registrationLimit) : '',
    isFeatured: event.isFeatured,
    liveStreamEnabled: event.liveStreamEnabled,
    liveStreamUrl: event.liveStreamUrl || '',
    remindersEnabled: event.remindersEnabled,
    gallery: event.gallery,
    documents: event.documents,
    tags: event.tags.join(', '),
    seoTitle: event.seoTitle || '',
    seoDescription: event.seoDescription || '',
    seoKeywords: event.seoKeywords || '',
  };
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-primary first:mt-0">{children}</h3>;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingEventId(null);
    setForm(emptyForm);
    setFormError('');
    setIsMapPickerOpen(false);
    setShowForm(true);
  };

  const openEditForm = (event: EventWithMeta) => {
    setEditingEventId(event.id);
    setForm(eventToForm(event));
    setFormError('');
    setIsMapPickerOpen(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEventId(null);
    setForm(emptyForm);
    setFormError('');
    setIsMapPickerOpen(false);
  };

  const uploadFile = async (file: File, kind: 'image' | 'document'): Promise<{ url: string; originalName: string } | null> => {
    const body = new FormData();
    body.append('file', file);
    body.append('kind', kind);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(data.error || 'Could not upload file');
      return null;
    }
    return { url: data.url, originalName: data.originalName };
  };

  const handleSingleImageUpload = async (field: 'bannerImage' | 'thumbnail', file: File) => {
    setFormError('');
    setUploadingField(field);
    const result = await uploadFile(file, 'image');
    if (result) setForm((f) => ({ ...f, [field]: result.url }));
    setUploadingField(null);
  };

  const handleGalleryUpload = async (file: File) => {
    setFormError('');
    setUploadingField('gallery');
    const result = await uploadFile(file, 'image');
    if (result) setForm((f) => ({ ...f, gallery: [...f.gallery, result.url] }));
    setUploadingField(null);
  };

  const handleDocumentUpload = async (file: File) => {
    setFormError('');
    setUploadingField('documents');
    const result = await uploadFile(file, 'document');
    if (result) {
      setForm((f) => ({ ...f, documents: [...f.documents, { name: result.originalName, url: result.url }] }));
    }
    setUploadingField(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        bannerImage: form.bannerImage,
        thumbnail: form.thumbnail,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        timeZone: form.timeZone,
        location: form.location,
        mapsLink: form.mapsLink,
        category: form.category,
        speakers: form.speakers.filter((s) => s.name.trim()),
        organizer: form.organizer,
        registrationRequired: form.registrationRequired,
        registrationLimit: form.registrationLimit ? Number(form.registrationLimit) : undefined,
        isFeatured: form.isFeatured,
        liveStreamEnabled: form.liveStreamEnabled,
        liveStreamUrl: form.liveStreamUrl,
        remindersEnabled: form.remindersEnabled,
        gallery: form.gallery,
        documents: form.documents,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        seoKeywords: form.seoKeywords,
      };

      const res = await fetch(editingEventId ? `/api/events/${editingEventId}` : '/api/events', {
        method: editingEventId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Could not save event');
        return;
      }

      await fetchEvents();
      closeForm();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    await fetchEvents();
  };

  const handleTogglePublish = async (event: EventWithMeta) => {
    await fetch(`/api/events/${event.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish: !event.isPublished }),
    });
    await fetchEvents();
  };

  const handleToggleCancel = async (event: EventWithMeta) => {
    await fetch(`/api/events/${event.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelled: !event.isCancelled }),
    });
    await fetchEvents();
  };

  const handleToggleLive = async (event: EventWithMeta) => {
    const res = await fetch(`/api/events/${event.id}/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ live: !event.isLive }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Could not update live status');
    }
    await fetchEvents();
  };

  const handleDuplicate = async (event: EventWithMeta) => {
    await fetch(`/api/events/${event.id}/duplicate`, { method: 'POST' });
    await fetchEvents();
  };

  const addSpeaker = () => setForm((f) => ({ ...f, speakers: [...f.speakers, { name: '', title: '' }] }));
  const updateSpeaker = (index: number, patch: Partial<SpeakerRow>) =>
    setForm((f) => ({ ...f, speakers: f.speakers.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  const removeSpeaker = (index: number) => setForm((f) => ({ ...f, speakers: f.speakers.filter((_, i) => i !== index) }));

  const removeGalleryImage = (index: number) => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  const removeDocument = (index: number) => setForm((f) => ({ ...f, documents: f.documents.filter((_, i) => i !== index) }));

  const statusStyles: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    today: 'bg-amber-100 text-amber-700',
    live: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-50 text-red-500',
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-secondary mb-2">Events</h1>
            <p className="text-text-light">Create and manage events shown on the public Events page</p>
          </div>
          {!showForm && (
            <button onClick={openAddForm} className="btn-primary shrink-0">
              + Add Event
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleFormSubmit} className="card mb-8">
            <h2 className="mb-2 text-xl font-semibold text-secondary">{editingEventId ? 'Edit Event' : 'New Event'}</h2>

            <SectionHeader>Basic Info</SectionHeader>
            <div className="mb-4">
              <label htmlFor="ev-title" className="mb-2 block text-sm font-medium text-secondary">
                Title
              </label>
              <input
                id="ev-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="ev-subtitle" className="mb-2 block text-sm font-medium text-secondary">
                Subtitle
              </label>
              <input
                id="ev-subtitle"
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="ev-description" className="mb-2 block text-sm font-medium text-secondary">
                Description
              </label>
              <textarea
                id="ev-description"
                rows={5}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="ev-category" className="mb-2 block text-sm font-medium text-secondary">
                Category
              </label>
              <select
                id="ev-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input-field"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <SectionHeader>Media</SectionHeader>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Banner Image</label>
                {form.bannerImage ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image */}
                    <img src={form.bannerImage} alt="Banner preview" className="h-20 w-32 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, bannerImage: '' }))}
                      className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingField === 'bannerImage'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSingleImageUpload('bannerImage', file);
                    }}
                    className="input-field"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Thumbnail</label>
                {form.thumbnail ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image */}
                    <img src={form.thumbnail} alt="Thumbnail preview" className="h-20 w-20 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, thumbnail: '' }))}
                      className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingField === 'thumbnail'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSingleImageUpload('thumbnail', file);
                    }}
                    className="input-field"
                  />
                )}
              </div>
            </div>

            <SectionHeader>Date &amp; Time</SectionHeader>
            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="ev-date" className="mb-2 block text-sm font-medium text-secondary">
                  Event Date
                </label>
                <input
                  id="ev-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="ev-start" className="mb-2 block text-sm font-medium text-secondary">
                  Start Time
                </label>
                <input
                  id="ev-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="ev-end" className="mb-2 block text-sm font-medium text-secondary">
                  End Time
                </label>
                <input
                  id="ev-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="ev-tz" className="mb-2 block text-sm font-medium text-secondary">
                  Time Zone
                </label>
                <input
                  id="ev-tz"
                  type="text"
                  value={form.timeZone}
                  onChange={(e) => setForm((f) => ({ ...f, timeZone: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <SectionHeader>Location</SectionHeader>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ev-location" className="mb-2 block text-sm font-medium text-secondary">
                  Location
                </label>
                <input
                  id="ev-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Jama Masjid Muslim Town"
                  required
                />
              </div>
              <div>
                <label htmlFor="ev-maps" className="mb-2 block text-sm font-medium text-secondary">
                  Google Maps Link
                </label>
                <div className="flex gap-2">
                  <input
                    id="ev-maps"
                    type="url"
                    value={form.mapsLink}
                    onChange={(e) => setForm((f) => ({ ...f, mapsLink: e.target.value }))}
                    className="input-field"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen((open) => !open)}
                    className="btn-secondary shrink-0 px-3 text-sm"
                  >
                    📍 {isMapPickerOpen ? 'Hide Map' : 'Pick on Map'}
                  </button>
                </div>
              </div>
            </div>

            {isMapPickerOpen && (
              <div className="mb-4">
                <LocationMapPicker
                  onSelect={(lat, lng) =>
                    setForm((f) => ({
                      ...f,
                      mapsLink: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                    }))
                  }
                />
              </div>
            )}

            <SectionHeader>People</SectionHeader>
            <div className="mb-4">
              <label htmlFor="ev-organizer" className="mb-2 block text-sm font-medium text-secondary">
                Organizer
              </label>
              <input
                id="ev-organizer"
                type="text"
                value={form.organizer}
                onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div className="mb-4">
              <span className="mb-2 block text-sm font-medium text-secondary">Speakers</span>
              <div className="space-y-2">
                {form.speakers.map((speaker, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={speaker.name}
                      onChange={(e) => updateSpeaker(i, { name: e.target.value })}
                      placeholder="Speaker name"
                      className="input-field"
                    />
                    <input
                      type="text"
                      value={speaker.title}
                      onChange={(e) => updateSpeaker(i, { title: e.target.value })}
                      placeholder="Title (optional)"
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpeaker(i)}
                      className="shrink-0 rounded-lg border-2 border-red-200 px-3 text-sm font-semibold text-red-500 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSpeaker} className="btn-secondary mt-2 px-4 py-1.5 text-sm">
                + Add Speaker
              </button>
            </div>

            <SectionHeader>Registration</SectionHeader>
            <div className="mb-4 flex items-center gap-2">
              <input
                id="ev-reg-required"
                type="checkbox"
                checked={form.registrationRequired}
                onChange={(e) => setForm((f) => ({ ...f, registrationRequired: e.target.checked }))}
                className="h-4 w-4"
              />
              <label htmlFor="ev-reg-required" className="text-sm font-medium text-secondary">
                Registration Required
              </label>
            </div>
            {form.registrationRequired && (
              <div className="mb-4">
                <label htmlFor="ev-reg-limit" className="mb-2 block text-sm font-medium text-secondary">
                  Registration Limit (leave blank for unlimited)
                </label>
                <input
                  id="ev-reg-limit"
                  type="number"
                  min={1}
                  value={form.registrationLimit}
                  onChange={(e) => setForm((f) => ({ ...f, registrationLimit: e.target.value }))}
                  className="input-field"
                />
              </div>
            )}

            <SectionHeader>Live Stream</SectionHeader>
            <div className="mb-4 flex items-center gap-2">
              <input
                id="ev-live-enabled"
                type="checkbox"
                checked={form.liveStreamEnabled}
                onChange={(e) => setForm((f) => ({ ...f, liveStreamEnabled: e.target.checked }))}
                className="h-4 w-4"
              />
              <label htmlFor="ev-live-enabled" className="text-sm font-medium text-secondary">
                Live Stream Enabled
              </label>
            </div>
            {form.liveStreamEnabled && (
              <div className="mb-4">
                <label htmlFor="ev-live-url" className="mb-2 block text-sm font-medium text-secondary">
                  Live Stream URL
                </label>
                <input
                  id="ev-live-url"
                  type="url"
                  value={form.liveStreamUrl}
                  onChange={(e) => setForm((f) => ({ ...f, liveStreamUrl: e.target.value }))}
                  className="input-field"
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}

            <SectionHeader>Gallery (post-event photos)</SectionHeader>
            <div className="mb-4">
              {form.gallery.length > 0 && (
                <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {form.gallery.map((src, i) => (
                    <div key={i} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image */}
                      <img src={src} alt={`Gallery ${i + 1}`} className="aspect-square rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploadingField === 'gallery'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGalleryUpload(file);
                  e.target.value = '';
                }}
                className="input-field"
              />
            </div>

            <SectionHeader>Documents / PDFs</SectionHeader>
            <div className="mb-4">
              {form.documents.length > 0 && (
                <div className="mb-3 space-y-2">
                  {form.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                      <span className="text-sm text-secondary">📄 {doc.name}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(i)}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
                disabled={uploadingField === 'documents'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDocumentUpload(file);
                  e.target.value = '';
                }}
                className="input-field"
              />
            </div>

            <SectionHeader>Tags &amp; SEO</SectionHeader>
            <div className="mb-4">
              <label htmlFor="ev-tags" className="mb-2 block text-sm font-medium text-secondary">
                Tags (comma-separated)
              </label>
              <input
                id="ev-tags"
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="input-field"
                placeholder="ramadan, community, karachi"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="ev-seo-title" className="mb-2 block text-sm font-medium text-secondary">
                SEO Title
              </label>
              <input
                id="ev-seo-title"
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="ev-seo-desc" className="mb-2 block text-sm font-medium text-secondary">
                SEO Description
              </label>
              <textarea
                id="ev-seo-desc"
                rows={2}
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                className="input-field resize-none"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="ev-seo-keywords" className="mb-2 block text-sm font-medium text-secondary">
                SEO Keywords (comma-separated)
              </label>
              <input
                id="ev-seo-keywords"
                type="text"
                value={form.seoKeywords}
                onChange={(e) => setForm((f) => ({ ...f, seoKeywords: e.target.value }))}
                className="input-field"
              />
            </div>

            <SectionHeader>Other</SectionHeader>
            <div className="mb-4 flex items-center gap-2">
              <input
                id="ev-featured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="h-4 w-4"
              />
              <label htmlFor="ev-featured" className="text-sm font-medium text-secondary">
                Featured Event
              </label>
            </div>
            <div className="mb-6 flex items-center gap-2">
              <input
                id="ev-reminders"
                type="checkbox"
                checked={form.remindersEnabled}
                onChange={(e) => setForm((f) => ({ ...f, remindersEnabled: e.target.checked }))}
                className="h-4 w-4"
              />
              <label htmlFor="ev-reminders" className="text-sm font-medium text-secondary">
                Reminders Enabled
              </label>
            </div>

            {formError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{formError}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">
                {isSaving ? 'Saving...' : editingEventId ? 'Save Changes' : 'Add Event'}
              </button>
              <button type="button" onClick={closeForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗓️</div>
            <h3 className="text-2xl font-bold text-secondary mb-2">No events yet</h3>
            <p className="text-text-light">Add your first event to show it on the public Events page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    {(event.thumbnail || event.bannerImage) && (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL
                      <img
                        src={event.thumbnail || event.bannerImage}
                        alt={event.title}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover bg-gray-100"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="font-bold text-secondary">{event.title}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[event.status]}`}>
                          {event.status}
                        </span>
                        {!event.isPublished && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">Draft</span>
                        )}
                      </div>
                      <p className="text-sm text-primary font-semibold">
                        {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })} · {event.category}
                      </p>
                      <p className="text-sm text-text-light truncate">{event.location}</p>
                      {event.registrationRequired && (
                        <p className="text-xs text-text-light mt-1">
                          {event.registrationCount} registered
                          {event.remainingSeats !== null && ` · ${event.remainingSeats} seats left`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button onClick={() => openEditForm(event)} className="btn-secondary px-3 py-1.5 text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleTogglePublish(event)} className="btn-secondary px-3 py-1.5 text-sm">
                      {event.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleToggleCancel(event)} className="btn-secondary px-3 py-1.5 text-sm">
                      {event.isCancelled ? 'Un-cancel' : 'Cancel'}
                    </button>
                    {event.liveStreamEnabled && (
                      <button
                        onClick={() => handleToggleLive(event)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${
                          event.isLive ? 'bg-red-600 text-white' : 'btn-secondary'
                        }`}
                      >
                        {event.isLive ? 'End Live' : 'Go Live'}
                      </button>
                    )}
                    <button onClick={() => handleDuplicate(event)} className="btn-secondary px-3 py-1.5 text-sm">
                      Duplicate
                    </button>
                    {event.registrationRequired && (
                      <Link href={`/admin/events/${event.id}/registrations`} className="btn-secondary px-3 py-1.5 text-sm">
                        Registrations
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
