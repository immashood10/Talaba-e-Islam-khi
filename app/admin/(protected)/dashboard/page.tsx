'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProgressBar from '@/components/ProgressBar';
import { Campaign, Donation, mockDonations } from '@/lib/mock-data';

interface EventAnalytics {
  upcoming: number;
  today: number;
  live: number;
  completed: number;
  cancelled: number;
  totalRegistrations: number;
  mostPopularEvent: { id: string; title: string; registrationCount: number } | null;
}

interface CampaignCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface CampaignFormState {
  title: string;
  description: string;
  story: string;
  image: string;
  currentAmount: string;
  goal: string;
  donors: string;
  daysLeft: string;
  category: string;
  organiserName: string;
  organiserAvatar: string;
}

const emptyForm: CampaignFormState = {
  title: '',
  description: '',
  story: '',
  image: '',
  currentAmount: '0',
  goal: '',
  donors: '0',
  daysLeft: '30',
  category: '',
  organiserName: '',
  organiserAvatar: '',
};

function campaignToForm(campaign: Campaign): CampaignFormState {
  return {
    title: campaign.title,
    description: campaign.description,
    story: campaign.story,
    image: typeof campaign.image === 'string' ? campaign.image : '',
    currentAmount: String(campaign.currentAmount),
    goal: String(campaign.goal),
    donors: String(campaign.donors),
    daysLeft: String(campaign.daysLeft),
    category: campaign.category,
    organiserName: campaign.organiser.name,
    organiserAvatar: typeof campaign.organiser.avatar === 'string' ? campaign.organiser.avatar : '',
  };
}

export default function AdminDashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignCategories, setCampaignCategories] = useState<CampaignCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donations'>('campaigns');
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'image' | 'organiserAvatar' | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchEventAnalytics();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns);
      setCampaignCategories(data.categories ?? []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventAnalytics = async () => {
    try {
      const res = await fetch('/api/events/analytics');
      if (!res.ok) return;
      setEventAnalytics(await res.json());
    } catch (error) {
      console.error('Error fetching event analytics:', error);
    }
  };

  const openAddForm = () => {
    setEditingCampaignId(null);
    setForm({ ...emptyForm, category: campaignCategories[0]?.label ?? '' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (campaign: Campaign) => {
    setEditingCampaignId(campaign.id);
    setForm(campaignToForm(campaign));
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCampaignId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleImageUpload = async (field: 'image' | 'organiserAvatar', file: File) => {
    setFormError('');
    setUploadingField(field);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Could not upload image');
        return;
      }

      setForm((f) => ({ ...f, [field]: data.url }));
    } catch {
      setFormError('Could not upload image. Please try again.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const currentAmount = parseFloat(form.currentAmount);
    const goal = parseFloat(form.goal);
    const donors = parseInt(form.donors, 10);
    const daysLeft = parseInt(form.daysLeft, 10);

    if (Number.isNaN(currentAmount) || currentAmount < 0) {
      setFormError('Please enter a valid raised amount');
      return;
    }
    if (Number.isNaN(goal) || goal <= 0) {
      setFormError('Please enter a valid goal amount');
      return;
    }
    if (Number.isNaN(donors) || donors < 0) {
      setFormError('Please enter a valid number of supporters');
      return;
    }
    if (Number.isNaN(daysLeft) || daysLeft < 0) {
      setFormError('Please enter a valid number of days left');
      return;
    }
    if (!form.image) {
      setFormError('Please upload an image');
      return;
    }
    if (!form.organiserAvatar) {
      setFormError('Please upload an organiser photo');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        story: form.story,
        image: form.image,
        currentAmount,
        goal,
        donors,
        daysLeft,
        category: form.category,
        organiser: { name: form.organiserName, avatar: form.organiserAvatar },
      };

      const res = await fetch(editingCampaignId ? `/api/campaign/${editingCampaignId}` : '/api/campaigns', {
        method: editingCampaignId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Could not save initiative');
        return;
      }

      await fetchDashboardData();
      closeForm();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this initiative? This cannot be undone.')) return;
    await fetch(`/api/campaign/${id}`, { method: 'DELETE' });
    await fetchDashboardData();
  };

  const donations: Donation[] = mockDonations;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-2">Admin Dashboard</h1>
          <p className="text-text-light">
            Manage initiatives and monitor platform activity
          </p>
        </div>

        {/* Event Analytics */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-secondary">Event Analytics</h2>
          {eventAnalytics ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: 'Upcoming', value: eventAnalytics.upcoming, color: 'text-blue-600' },
                  { label: "Today's Events", value: eventAnalytics.today, color: 'text-amber-600' },
                  { label: 'Live', value: eventAnalytics.live, color: 'text-red-600' },
                  { label: 'Completed', value: eventAnalytics.completed, color: 'text-gray-500' },
                  { label: 'Cancelled', value: eventAnalytics.cancelled, color: 'text-red-400' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-text-light">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
                  <p className="text-2xl font-bold text-primary">{eventAnalytics.totalRegistrations}</p>
                  <p className="text-xs text-text-light">Total Registrations</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
                  {eventAnalytics.mostPopularEvent ? (
                    <>
                      <p className="truncate text-lg font-bold text-secondary">{eventAnalytics.mostPopularEvent.title}</p>
                      <p className="text-xs text-text-light">
                        Most Popular Event · {eventAnalytics.mostPopularEvent.registrationCount} registrations
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-text-light">No registrations yet</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl border border-gray-100 bg-gray-100" />
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'campaigns' ? 'text-primary' : 'text-text-light hover:text-secondary'
            }`}
          >
            All Initiatives ({campaigns.length})
            {activeTab === 'campaigns' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'donations' ? 'text-primary' : 'text-text-light hover:text-secondary'
            }`}
          >
            All Contributions ({donations.length})
            {activeTab === 'donations' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {activeTab === 'campaigns' && (
          <div className="mb-6 flex justify-end">
            {!showForm && (
              <button onClick={openAddForm} className="btn-primary">
                + Add Initiative
              </button>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && showForm && (
          <form onSubmit={handleFormSubmit} className="card mb-8">
            <h2 className="mb-4 text-xl font-semibold text-secondary">
              {editingCampaignId ? 'Edit Initiative' : 'New Initiative'}
            </h2>

            <div className="mb-4">
              <label htmlFor="campaign-title" className="mb-2 block text-sm font-medium text-secondary">
                Title
              </label>
              <input
                id="campaign-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="campaign-description" className="mb-2 block text-sm font-medium text-secondary">
                Short Description
              </label>
              <textarea
                id="campaign-description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="campaign-story" className="mb-2 block text-sm font-medium text-secondary">
                Full Story
              </label>
              <textarea
                id="campaign-story"
                rows={5}
                value={form.story}
                onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
                className="input-field resize-none"
                required
              />
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Image</label>
                {form.image ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image */}
                    <img src={form.image} alt="Initiative preview" className="h-20 w-32 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingField === 'image'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('image', file);
                    }}
                    className="input-field"
                  />
                )}
              </div>

              <div>
                <label htmlFor="campaign-category" className="mb-2 block text-sm font-medium text-secondary">
                  Category
                </label>
                <select
                  id="campaign-category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {campaignCategories.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="campaign-current" className="mb-2 block text-sm font-medium text-secondary">
                  Raised ($)
                </label>
                <input
                  id="campaign-current"
                  type="number"
                  min={0}
                  value={form.currentAmount}
                  onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="campaign-goal" className="mb-2 block text-sm font-medium text-secondary">
                  Goal ($)
                </label>
                <input
                  id="campaign-goal"
                  type="number"
                  min={1}
                  value={form.goal}
                  onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="campaign-donors" className="mb-2 block text-sm font-medium text-secondary">
                  Supporters
                </label>
                <input
                  id="campaign-donors"
                  type="number"
                  min={0}
                  value={form.donors}
                  onChange={(e) => setForm((f) => ({ ...f, donors: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="campaign-days-left" className="mb-2 block text-sm font-medium text-secondary">
                  Days Left
                </label>
                <input
                  id="campaign-days-left"
                  type="number"
                  min={0}
                  value={form.daysLeft}
                  onChange={(e) => setForm((f) => ({ ...f, daysLeft: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="campaign-organiser-name" className="mb-2 block text-sm font-medium text-secondary">
                  Organiser Name
                </label>
                <input
                  id="campaign-organiser-name"
                  type="text"
                  value={form.organiserName}
                  onChange={(e) => setForm((f) => ({ ...f, organiserName: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Organiser Photo</label>
                {form.organiserAvatar ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image */}
                    <img src={form.organiserAvatar} alt="Organiser preview" className="h-12 w-12 rounded-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, organiserAvatar: '' }))}
                      className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingField === 'organiserAvatar'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('organiserAvatar', file);
                    }}
                    className="input-field"
                  />
                )}
              </div>
            </div>

            {formError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{formError}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">
                {isSaving ? 'Saving...' : editingCampaignId ? 'Save Changes' : 'Add Initiative'}
              </button>
              <button type="button" onClick={closeForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-24 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeTab === 'campaigns' ? (
          campaigns.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-2xl font-bold text-secondary mb-2">
                No initiatives yet
              </h3>
              <p className="text-text-light mb-6">
                Initiatives will appear here once they&apos;re added.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="card group flex flex-col gap-6 md:flex-row">
                  <Link href={`/campaign/${campaign.id}`} className="relative h-48 w-full flex-shrink-0 md:h-32 md:w-48">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                      {campaign.category}
                    </span>
                  </Link>

                  <div className="flex-1">
                    <Link href={`/campaign/${campaign.id}`}>
                      <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                    </Link>

                    <div className="mb-4">
                      <ProgressBar
                        current={campaign.currentAmount}
                        goal={campaign.goal}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-text-light">
                      <span>{campaign.donors} supporters</span>
                      <span>{campaign.daysLeft} days left</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 self-start md:flex-col">
                    <button onClick={() => openEditForm(campaign)} className="btn-secondary px-4 py-1.5 text-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="rounded-lg border-2 border-red-200 px-4 py-1.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {donations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold text-secondary mb-2">
                  No contributions yet
                </h3>
                <p className="text-text-light">
                  Contributions will show up here once supporters start giving.
                </p>
              </div>
            ) : (
              donations.map((donation) => {
                const campaign = campaigns.find(
                  (c) => c.id === donation.campaignId
                );
                return (
                  <div
                    key={donation.id}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-lg text-primary">
                        ${donation.amount}
                      </p>
                      <p className="text-text-light text-sm mb-1">
                        {donation.donorName} → {campaign?.title || 'Initiative'}
                      </p>
                      {donation.message && (
                        <p className="text-secondary italic">
                          &ldquo;{donation.message}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-text-light mt-2">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {campaign && (
                      <Link
                        href={`/campaign/${campaign.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        View Initiative →
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 max-w-md mx-auto">
          <Link
            href="/campaigns"
            className="card group hover:-translate-y-1 p-8 text-center block"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              🔍
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">
              View Public Initiatives
            </h3>
            <p className="text-text-light">
              See how initiatives appear to supporters.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
