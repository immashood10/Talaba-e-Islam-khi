'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { LivePost } from '@/lib/live-store';

export default function AdminLivePage() {
  const [form, setForm] = useState({ title: '', description: '', streamUrl: '', isActive: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchLive();
  }, []);

  const fetchLive = async () => {
    try {
      const res = await fetch('/api/live');
      const data: { live: LivePost | null } = await res.json();
      if (data.live) {
        setForm({
          title: data.live.title,
          description: data.live.description,
          streamUrl: data.live.streamUrl,
          isActive: data.live.isActive,
        });
      }
    } catch (err) {
      console.error('Error fetching live post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/live', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSavedAt(new Date().toLocaleTimeString());
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-2">Live</h1>
          <p className="text-text-light">
            Publish or update the live stream shown on the public /live page
          </p>
        </div>

        <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-bold text-secondary mb-3">How to go live for free (via YouTube)</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-text-light">
            <div>
              <p className="font-semibold text-secondary mb-1">From a phone camera</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open the YouTube app and tap Create → Go Live</li>
                <li>Start streaming from your phone&apos;s camera</li>
                <li>Copy the video link YouTube gives you</li>
                <li>Paste it below as the Stream URL</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold text-secondary mb-1">From a DSLR (via OBS)</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to studio.youtube.com → Create → Go Live</li>
                <li>Copy the Stream Key/URL into OBS Studio</li>
                <li>Connect your DSLR to OBS via a capture card</li>
                <li>Start streaming in OBS, then paste the YouTube link below</li>
              </ol>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-light">
            Both are completely free with no viewer limits &mdash; YouTube handles the streaming, this page just controls what shows on your public /live page.
          </p>
        </div>

        {isLoading ? (
          <div className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-10 bg-gray-200 rounded mb-4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-secondary mb-2">
                Title<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="e.g. Friday Night Fundraiser Live"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-secondary mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field resize-none"
                placeholder="What's happening in this live stream?"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="streamUrl" className="block text-sm font-medium text-secondary mb-2">
                Stream URL<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="streamUrl"
                type="url"
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                className="input-field"
                placeholder="https://www.youtube.com/embed/..."
                required
              />
              <p className="mt-1 text-xs text-text-light">
                Paste a YouTube link (watch, youtu.be, or /live/ — we&apos;ll convert it automatically) or an embed URL from another provider.
              </p>
            </div>

            <label className="mb-6 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-secondary">
                Live is currently active (visible on the public site)
              </span>
            </label>

            {error && <p className="mb-4 text-sm text-red-500 animate-fade-in">{error}</p>}
            {savedAt && !error && (
              <p className="mb-4 text-sm text-primary animate-fade-in">Saved at {savedAt}</p>
            )}

            <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Live Details'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
