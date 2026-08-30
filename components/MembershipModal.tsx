'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMember } from '@/lib/member-context';
import PasswordField from '@/components/PasswordField';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'start' | 'login' | 'signup';

function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7h2.4l.36-2.8H13.5V9.4c0-.81.22-1.36 1.38-1.36h1.48V5.55c-.26-.03-1.13-.11-2.15-.11-2.13 0-3.59 1.3-3.59 3.69v2.06H8.2V14h2.42v7h2.88z" />
    </svg>
  );
}

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 01-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.66z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A12 12 0 0012 24z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 010-4.54V6.62H1.28a12 12 0 000 10.76z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0A12 12 0 001.28 6.62l3.99 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

function BackIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const { login } = useMember();
  const [mode, setMode] = useState<Mode>('start');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) return;
    // Reset the form once the close animation/unmount has had a chance to start.
    setMode('start');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        return;
      }

      login(data.member);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/member/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Could not create your account');
        return;
      }

      login(data.member);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-soft-lg border-t-4 border-primary max-h-[90vh] overflow-y-auto"
      >
        {mode !== 'start' && (
          <button
            onClick={() => switchMode('start')}
            aria-label="Back"
            className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-secondary"
          >
            <BackIcon />
          </button>
        )}

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-secondary"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {mode === 'start' && (
          <>
            <h2 id="membership-modal-title" className="text-2xl sm:text-3xl font-bold text-secondary">
              Join Talaba e Islam Karachi
            </h2>
            <p className="mt-2 text-text-light">Sign up or log in to become a member</p>

            <div className="mt-6 space-y-3">
              <a
                href="/api/auth/facebook"
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1466d1]"
              >
                <FacebookIcon />
                Continue with Facebook
              </a>

              <a
                href="/api/auth/google"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-gray-50"
              >
                <GoogleIcon />
                Continue with Google
              </a>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-text-light">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => switchMode('login')}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                Log in
              </button>
              <button
                onClick={() => switchMode('signup')}
                className="w-full rounded-lg border-2 border-secondary px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white"
              >
                Sign up
              </button>
            </div>

            <p className="mt-6 text-xs text-text-light">
              By signing up, you agree to our{' '}
              <Link href="/about#terms" className="font-medium text-secondary hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/about#privacy-policy" className="font-medium text-secondary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}

        {mode === 'login' && (
          <>
            <h2 id="membership-modal-title" className="text-2xl sm:text-3xl font-bold text-secondary text-center">
              Log in
            </h2>
            <p className="mt-2 text-text-light text-center">Welcome back, member</p>

            <form onSubmit={handleLogin} className="mt-6">
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-secondary mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <PasswordField
                id="login-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              {error && <p className="mb-4 text-sm text-red-500 text-center animate-fade-in">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-light">
              Don&apos;t have an account?{' '}
              <button onClick={() => switchMode('signup')} className="font-medium text-secondary hover:underline">
                Sign up
              </button>
            </p>
          </>
        )}

        {mode === 'signup' && (
          <>
            <h2 id="membership-modal-title" className="text-2xl sm:text-3xl font-bold text-secondary text-center">
              Sign up
            </h2>
            <p className="mt-2 text-text-light text-center">Become a member of Talaba e Islam Karachi</p>

            <form onSubmit={handleSignup} className="mt-6">
              <div className="mb-4">
                <label htmlFor="signup-name" className="block text-sm font-medium text-secondary mb-2">
                  Full name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  autoComplete="name"
                  autoFocus
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="signup-email" className="block text-sm font-medium text-secondary mb-2">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="signup-phone" className="block text-sm font-medium text-secondary mb-2">
                  Phone
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  autoComplete="tel"
                  required
                />
              </div>

              <PasswordField
                id="signup-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />

              <PasswordField
                id="signup-confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />

              {error && <p className="mb-4 text-sm text-red-500 text-center animate-fade-in">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-light">
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="font-medium text-secondary hover:underline">
                Log in
              </button>
            </p>

            <p className="mt-4 text-xs text-text-light">
              By signing up, you agree to our{' '}
              <Link href="/about#terms" className="font-medium text-secondary hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/about#privacy-policy" className="font-medium text-secondary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
