'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PasswordField from '@/components/PasswordField';
import { useMember } from '@/lib/member-context';
import type { Order } from '@/lib/order-store';
import type { EventRegistration } from '@/lib/event-registration-store';
import type { EventWithMeta } from '@/lib/event-view';
import EventStatusBadge from '@/components/EventStatusBadge';

export default function AccountPage() {
  const router = useRouter();
  const { member, isAdmin, isLoading, refresh } = useMember();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const [registeredEvents, setRegisteredEvents] = useState<{ registration: EventRegistration; event: EventWithMeta }[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [cancellingEventId, setCancellingEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !member && !isAdmin) {
      router.replace('/');
    }
  }, [isLoading, member, isAdmin, router]);

  useEffect(() => {
    if (!member) return;
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone ?? '');
  }, [member]);

  useEffect(() => {
    if (!member) return;
    fetchOrders();
    fetchRegisteredEvents();
  }, [member]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/shop/orders/mine');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      // ignore transient fetch errors
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await fetch('/api/events/mine');
      const data = await res.json();
      setRegisteredEvents(data.items ?? []);
    } catch {
      // ignore transient fetch errors
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleCancelEventRegistration = async (eventId: string) => {
    if (!confirm('Cancel your registration for this event?')) return;
    setEventsError('');
    setCancellingEventId(eventId);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: 'DELETE' });
      if (!res.ok) {
        setEventsError('Could not cancel your registration');
        return;
      }
      await fetchRegisteredEvents();
    } catch {
      setEventsError('Something went wrong. Please try again.');
    } finally {
      setCancellingEventId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    setOrdersError('');
    setCancellingOrderId(orderId);

    try {
      const res = await fetch(`/api/shop/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOrdersError(data.error || 'Could not cancel this order');
        return;
      }

      await fetchOrders();
    } catch {
      setOrdersError('Something went wrong. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const orderStatusLabel = (status: Order['status']) =>
    status === 'fulfilled' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : 'Pending';

  const orderStatusClass = (status: Order['status']) =>
    status === 'fulfilled'
      ? 'bg-primary/10 text-primary'
      : status === 'cancelled'
        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    try {
      const res = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setProfileError(data.error || 'Could not update your account');
        return;
      }

      await refresh();
      setProfileSuccess('Your profile has been updated');
    } catch {
      setProfileError('Something went wrong. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch('/api/member/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPasswordError(data.error || 'Could not update your password');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      await refresh();
      setPasswordSuccess('Your password has been updated');
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading || (!member && !isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-text-light">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!member && isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-secondary">You&apos;re signed in as admin</h1>
            <p className="mt-2 text-text-light">
              This page manages a member profile, which admin accounts don&apos;t have. Manage the site from the admin dashboard instead.
            </p>
            <Link href="/admin/dashboard" className="btn-primary mt-6 inline-block">
              Go to Admin Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary">Account Settings</h1>
          <p className="mt-2 text-text-light">Manage your profile and password</p>

          <div className="card mt-8">
            <h2 className="mb-4 text-xl font-semibold text-secondary">Your Orders</h2>

            {isLoadingOrders ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-gray-100 p-4 dark:border-slate-800">
                    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-text-light">You haven&apos;t placed any orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-secondary">
                        {order.quantity} × {order.productName}
                      </p>
                      <p className="text-sm text-text-light dark:text-slate-400">
                        Rs. {(order.unitPrice * order.quantity).toLocaleString()} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:hover:bg-red-900/20"
                        >
                          {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ordersError && <p className="mt-4 text-sm text-red-500 animate-fade-in">{ordersError}</p>}
          </div>

          <div className="card mt-8">
            <h2 className="mb-4 text-xl font-semibold text-secondary">My Registered Events</h2>

            {isLoadingEvents ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-gray-100 p-4 dark:border-slate-800">
                    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : registeredEvents.length === 0 ? (
              <p className="text-sm text-text-light">You haven&apos;t registered for any events yet.</p>
            ) : (
              <div className="space-y-3">
                {registeredEvents.map(({ registration, event }) => (
                  <div
                    key={registration.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <Link href={`/events/${event.id}`} className="font-semibold text-secondary hover:text-primary">
                        {event.title}
                      </Link>
                      <p className="text-sm text-text-light dark:text-slate-400">
                        {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })} · {event.location}
                      </p>
                      {registration.checkedIn && (
                        <p className="mt-1 text-xs font-semibold text-primary">✓ Checked in</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <EventStatusBadge status={event.status} />
                      {event.status === 'upcoming' || event.status === 'today' ? (
                        <button
                          onClick={() => handleCancelEventRegistration(event.id)}
                          disabled={cancellingEventId === event.id}
                          className="rounded-lg border-2 border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:hover:bg-red-900/20"
                        >
                          {cancellingEventId === event.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {eventsError && <p className="mt-4 text-sm text-red-500 animate-fade-in">{eventsError}</p>}
          </div>

          <div className="card mt-8">
            <h2 className="mb-4 text-xl font-semibold text-secondary">Profile</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-4">
                <label htmlFor="account-name" className="mb-2 block text-sm font-medium text-secondary">
                  Full name
                </label>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="account-email" className="mb-2 block text-sm font-medium text-secondary">
                  Email
                </label>
                <input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="account-phone" className="mb-2 block text-sm font-medium text-secondary">
                  Phone
                </label>
                <input
                  id="account-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  autoComplete="tel"
                />
              </div>

              {profileError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{profileError}</p>}
              {profileSuccess && <p className="mb-4 text-sm text-primary animate-fade-in">{profileSuccess}</p>}

              <button type="submit" disabled={isSavingProfile} className="btn-primary disabled:opacity-60">
                {isSavingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="card mt-8">
            <h2 className="mb-4 text-xl font-semibold text-secondary">
              {member.hasPassword ? 'Change password' : 'Set a password'}
            </h2>
            {!member.hasPassword && (
              <p className="-mt-2 mb-4 text-sm text-text-light">
                You signed in with a social account. Set a password if you&apos;d also like to log in with your email.
              </p>
            )}
            <form onSubmit={handlePasswordSubmit}>
              {member.hasPassword && (
                <PasswordField
                  id="account-current-password"
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  autoComplete="current-password"
                />
              )}

              <PasswordField
                id="account-new-password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />

              <PasswordField
                id="account-confirm-password"
                label="Confirm new password"
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                autoComplete="new-password"
              />

              {passwordError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{passwordError}</p>}
              {passwordSuccess && <p className="mb-4 text-sm text-primary animate-fade-in">{passwordSuccess}</p>}

              <button type="submit" disabled={isSavingPassword} className="btn-primary disabled:opacity-60">
                {isSavingPassword
                  ? 'Saving...'
                  : member.hasPassword
                    ? 'Update password'
                    : 'Set password'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
