'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Story, StoryMediaType } from '@/lib/story-store';
import type { StoryView } from '@/lib/story-view-store';

interface AdminStory extends Story {
  viewCount: number;
  views: StoryView[];
}

const MIN_VIDEO_SECONDS = 29;
const MAX_VIDEO_SECONDS = 61;

function formatTimeLeft(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

// Reads a video file's duration client-side so we can enforce the 30s-1min
// limit before uploading, without needing a server-side video-parsing dependency.
function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Could not read video file'));
    };
    video.src = URL.createObjectURL(file);
  });
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<StoryMediaType>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [viewersStoryId, setViewersStoryId] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      setStories(data.stories ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingStoryId(null);
    setMediaType('image');
    setMediaUrl('');
    setCaption('');
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (story: AdminStory) => {
    setEditingStoryId(story.id);
    setMediaType(story.mediaType);
    setMediaUrl(story.mediaUrl);
    setCaption(story.caption ?? '');
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStoryId(null);
    setMediaType('image');
    setMediaUrl('');
    setCaption('');
    setFormError('');
  };

  const switchMediaType = (type: StoryMediaType) => {
    setMediaType(type);
    setMediaUrl('');
    setFormError('');
  };

  const handleMediaUpload = async (file: File) => {
    setFormError('');

    if (mediaType === 'video') {
      let duration: number;
      try {
        duration = await readVideoDuration(file);
      } catch {
        setFormError('Could not read that video file. Please try a different file.');
        return;
      }
      if (duration < MIN_VIDEO_SECONDS || duration > MAX_VIDEO_SECONDS) {
        setFormError(`Video must be between 30 seconds and 1 minute long (this one is ${Math.round(duration)}s).`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', mediaType);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || `Could not upload ${mediaType}`);
        return;
      }
      setMediaUrl(data.url);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!mediaUrl) {
      setFormError(`Please upload ${mediaType === 'video' ? 'a video' : 'an image'} for the story`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(editingStoryId ? `/api/stories/${editingStoryId}` : '/api/stories', {
        method: editingStoryId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, mediaType, caption }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Could not save story');
        return;
      }

      await fetchStories();
      closeForm();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Delete this story? This cannot be undone.')) return;
    await fetch(`/api/stories/${id}`, { method: 'DELETE' });
    if (viewersStoryId === id) setViewersStoryId(null);
    if (editingStoryId === id) closeForm();
    await fetchStories();
  };

  const viewersStory = stories.find((s) => s.id === viewersStoryId);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-2">Stories</h1>
          <p className="text-text-light">Manage the story shown on the site logo. Each story auto-expires 24 hours after it&apos;s added.</p>
        </div>

        <div className="mb-6 flex justify-end">
          {!showForm && (
            <button onClick={openAddForm} className="btn-primary">
              + Add Story
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleFormSubmit} className="card mb-8">
            <h2 className="mb-4 text-xl font-semibold text-secondary">{editingStoryId ? 'Edit Story' : 'New Story'}</h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-secondary">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => switchMediaType('image')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    mediaType === 'image' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => switchMediaType('video')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    mediaType === 'video' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-secondary">
                {mediaType === 'video' ? 'Video (30 sec - 1 min)' : 'Image'}
              </label>
              {mediaUrl ? (
                <div className="flex items-center gap-4">
                  {mediaType === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption -- admin preview only, no audience relies on captions here
                    <video src={mediaUrl} controls className="h-32 w-24 rounded-lg bg-black object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL
                    <img src={mediaUrl} alt="Story preview" className="h-32 w-24 rounded-lg object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMediaUpload(file);
                  }}
                  className="input-field"
                />
              )}
              {isUploading && <p className="mt-2 text-xs text-text-light">Uploading...</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="story-caption" className="mb-2 block text-sm font-medium text-secondary">
                Caption (optional)
              </label>
              <textarea
                id="story-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field"
                rows={2}
                placeholder="A short line shown at the bottom of the story"
              />
            </div>

            {formError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{formError}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={isSaving || isUploading} className="btn-primary disabled:opacity-60">
                {isSaving ? 'Saving...' : editingStoryId ? 'Save Changes' : 'Add Story'}
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
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold text-secondary mb-2">No stories yet</h3>
            <p className="text-text-light">Add your first story to show it on the site logo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => {
              const isExpired = new Date(story.expiresAt).getTime() <= Date.now();
              return (
                <div
                  key={story.id}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative h-16 w-16 shrink-0">
                      {story.mediaType === 'video' ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption -- muted thumbnail preview, no audio to caption
                        <video src={story.mediaUrl} muted className="h-16 w-16 rounded-lg bg-black object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL
                        <img src={story.mediaUrl} alt={story.caption ?? 'Story'} className="h-16 w-16 rounded-lg object-cover bg-gray-100" />
                      )}
                      {story.mediaType === 'video' && (
                        <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            isExpired ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                        <span className="text-xs text-text-light">{formatTimeLeft(story.expiresAt)}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-secondary">{story.caption || 'No caption'}</p>
                      <p className="text-xs text-text-light">Added {new Date(story.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => setViewersStoryId(story.id)}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      Seen by {story.viewCount}
                    </button>
                    <button onClick={() => openEditForm(story)} className="btn-secondary px-4 py-2 text-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewersStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setViewersStoryId(null)}>
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-xl bg-white shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-secondary">Seen by ({viewersStory.views.length})</h3>
              <button
                onClick={() => setViewersStoryId(null)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-light hover:bg-gray-50"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {viewersStory.views.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-text-light">No one has viewed this story yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {[...viewersStory.views].reverse().map((view) => (
                    <div key={`${view.storyId}-${view.viewerId}`} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-secondary">{view.viewerName}</p>
                        {view.viewerEmail && <p className="truncate text-xs text-text-light">{view.viewerEmail}</p>}
                      </div>
                      <span className="shrink-0 text-xs text-text-light">{new Date(view.viewedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
