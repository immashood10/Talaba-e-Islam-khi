'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Ad } from '@/lib/ad-store';

interface AdFormState {
  advertiserName: string;
  imageUrl: string;
  linkUrl: string;
}

const emptyForm: AdFormState = { advertiserName: '', imageUrl: '', linkUrl: '' };

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [form, setForm] = useState<AdFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      setAds(data.ads ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingAdId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (ad: Ad) => {
    setEditingAdId(ad.id);
    setForm({
      advertiserName: ad.advertiserName,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAdId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleImageUpload = async (file: File) => {
    setFormError('');
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', 'image');
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || 'Could not upload image');
        return;
      }
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      const payload = {
        advertiserName: form.advertiserName,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl,
      };
      const res = await fetch(editingAdId ? `/api/ads/${editingAdId}` : '/api/ads', {
        method: editingAdId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Could not save ad');
        return;
      }

      await fetchAds();
      closeForm();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    await fetch(`/api/ads/${id}`, { method: 'DELETE' });
    await fetchAds();
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-2">Ads</h1>
          <p className="text-text-light">Manage the ads shown in the site&apos;s sidebar slot</p>
        </div>

        <div className="mb-6 flex justify-end">
          {!showForm && (
            <button onClick={openAddForm} className="btn-primary">
              + Add Ad
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleFormSubmit} className="card mb-8">
            <h2 className="mb-4 text-xl font-semibold text-secondary">
              {editingAdId ? 'Edit Ad' : 'New Ad'}
            </h2>

            <div className="mb-4">
              <label htmlFor="ad-advertiser" className="mb-2 block text-sm font-medium text-secondary">
                Advertiser name
              </label>
              <input
                id="ad-advertiser"
                type="text"
                value={form.advertiserName}
                onChange={(e) => setForm((f) => ({ ...f, advertiserName: e.target.value }))}
                className="input-field"
                placeholder="e.g., Mangwaoo.com"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-secondary">Image</label>
              {form.imageUrl ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL */}
                  <img src={form.imageUrl} alt="Ad preview" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                    className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="input-field"
                  />
                  {isUploading && <p className="mt-2 text-xs text-text-light">Uploading...</p>}
                  <div className="mt-3">
                    <label htmlFor="ad-image-url" className="mb-1 block text-xs text-text-light">
                      Or paste an image URL
                    </label>
                    <input
                      id="ad-image-url"
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className="input-field"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="ad-link" className="mb-2 block text-sm font-medium text-secondary">
                Link URL
              </label>
              <input
                id="ad-link"
                type="url"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                className="input-field"
                placeholder="https://wa.me/923150699930 or https://mangwaoo.com"
                required
              />
            </div>

            {formError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{formError}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">
                {isSaving ? 'Saving...' : editingAdId ? 'Save Changes' : 'Add Ad'}
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
        ) : ads.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-2xl font-bold text-secondary mb-2">No ads yet</h3>
            <p className="text-text-light">Add your first ad to show it in the site&apos;s sidebar slot.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL */}
                  <img src={ad.imageUrl} alt={ad.advertiserName} className="h-16 w-16 shrink-0 rounded-lg object-cover bg-gray-100" />
                  <div className="min-w-0">
                    <p className="font-bold text-secondary truncate">{ad.advertiserName}</p>
                    <p className="text-sm text-text-light truncate">{ad.linkUrl}</p>
                  </div>
                </div>

                <div className="flex gap-3 shrink-0">
                  <button onClick={() => openEditForm(ad)} className="btn-secondary px-4 py-2 text-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAd(ad.id)}
                    className="rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
