'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useCart } from '@/lib/cart-context';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const countryCodes = [
  { code: '+92', country: 'Pakistan' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+1', country: 'United States' },
];

// Pakistani mobile numbers are 11 digits in local format (e.g. 03001234567).
// When +92 is selected, a leading 0 is the local trunk prefix implied by the
// country code, so it must be dropped rather than kept (03001234567 -> 3001234567).
function normalizePhoneNumber(countryCode: string, rawPhone: string): { value: string; error: string } {
  const digits = rawPhone.replace(/\D/g, '');

  if (countryCode === '+92') {
    const local = digits.startsWith('0') ? digits.slice(1) : digits;
    if (local.length !== 10) {
      return { value: '', error: 'Enter a valid 11-digit Pakistani mobile number (e.g., 03001234567)' };
    }
    return { value: `+92${local}`, error: '' };
  }

  if (digits.length < 7 || digits.length > 12) {
    return { value: '', error: 'Enter a valid phone number' };
  }
  return { value: `${countryCode}${digits}`, error: '' };
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedPhone, setConfirmedPhone] = useState('');

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
    setIsCheckingOut(false);
    setName('');
    setCountryCode('+92');
    setPhone('');
    setError('');
    setIsSubmitting(false);
    setIsSuccess(false);
    setConfirmedPhone('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const { value: normalizedPhone, error: phoneError } = normalizePhoneNumber(countryCode, phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsSubmitting(true);

    const failed: string[] = [];

    for (const item of items) {
      try {
        const res = await fetch('/api/shop/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            customerName: name,
            phone: normalizedPhone,
          }),
        });

        if (res.ok) {
          removeFromCart(item.productId);
        } else {
          const data = await res.json().catch(() => ({}));
          failed.push(`${item.name}: ${data.error || 'could not be ordered'}`);
        }
      } catch {
        failed.push(`${item.name}: something went wrong`);
      }
    }

    setIsSubmitting(false);

    if (failed.length > 0) {
      setError(failed.join(' • '));
      return;
    }

    setConfirmedPhone(normalizedPhone);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-soft-lg border-t-4 border-primary max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-secondary"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          <div className="py-6 text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-secondary">Order request sent</h2>
            <p className="mt-2 text-text-light">We&apos;ll contact you at {confirmedPhone} to confirm your order.</p>
            <button
              onClick={() => {
                clearCart();
                onClose();
              }}
              className="btn-primary mt-6 w-full"
            >
              Done
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mb-4 text-5xl">🛒</div>
            <h2 id="cart-modal-title" className="text-2xl font-bold text-secondary">
              Your cart is empty
            </h2>
            <p className="mt-2 text-text-light">Add items from the shop to see them here.</p>
          </div>
        ) : !isCheckingOut ? (
          <>
            <h2 id="cart-modal-title" className="text-2xl font-bold text-secondary">
              Your Cart
            </h2>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL */}
                  <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg object-contain bg-gray-100 dark:bg-slate-800" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-secondary">{item.name}</p>
                    <p className="text-sm text-text-light">Rs. {item.price.toLocaleString()}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-secondary transition-colors hover:bg-gray-50 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-secondary transition-colors hover:bg-gray-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-medium text-secondary">Total ({totalItems} items)</span>
              <span className="text-xl font-bold text-primary">Rs. {totalPrice.toLocaleString()}</span>
            </div>

            <button type="button" onClick={() => setIsCheckingOut(true)} className="btn-primary mt-6 w-full">
              Checkout
            </button>
          </>
        ) : (
          <>
            <h2 id="cart-modal-title" className="text-2xl font-bold text-secondary">
              Checkout
            </h2>
            <p className="mt-2 text-text-light">
              {totalItems} items · Rs. {totalPrice.toLocaleString()}
            </p>

            <form onSubmit={handleCheckout} className="mt-6">
              <div className="mb-4">
                <label htmlFor="cart-name" className="block text-sm font-medium text-secondary mb-2">
                  Your name
                </label>
                <input
                  id="cart-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  autoComplete="name"
                  autoFocus
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="cart-phone" className="block text-sm font-medium text-secondary mb-2">
                  Phone number
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="input-field w-auto shrink-0"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} {c.country}
                      </option>
                    ))}
                  </select>
                  <input
                    id="cart-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field flex-1"
                    placeholder={countryCode === '+92' ? '03001234567' : undefined}
                    autoComplete="tel"
                    required
                  />
                </div>
                {countryCode === '+92' && (
                  <p className="mt-1.5 text-xs text-text-light">
                    Enter your 11-digit number, e.g. 03001234567
                  </p>
                )}
              </div>

              {error && <p className="mb-4 text-sm text-red-500 animate-fade-in">{error}</p>}

              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
                  {isSubmitting ? 'Placing order...' : 'Place Order Request'}
                </button>
                <button type="button" onClick={() => setIsCheckingOut(false)} className="btn-secondary">
                  Back
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
