'use client';

import { useState } from 'react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  onDonate: (amount: number, name: string) => void;
}

export default function DonationModal({
  isOpen,
  onClose,
  campaignTitle,
  onDonate,
}: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount);

    if (!finalAmount || finalAmount <= 0) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onDonate(finalAmount, name || 'Anonymous');
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setCustomAmount('');
    setName('');
    setSelectedMethod('card');
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-soft-lg w-full max-w-md animate-slide-up">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-text-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-secondary mb-2">
              Support this Initiative
            </h2>
            <p className="text-text-light text-sm mb-6">
              Your contribution to &quot;{campaignTitle}&quot; will make a difference
            </p>

            <form onSubmit={handleSubmit}>
              {/* Preset Amounts */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset.toString());
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-lg border-2 font-semibold transition-all duration-200 ${
                      amount === preset.toString() && !customAmount
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-primary/50 text-text-dark'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount('');
                  }}
                  placeholder="Enter custom amount"
                  className="input-field pl-8 text-lg"
                  min="1"
                />
              </div>

              {/* Name */}
              <div className="mb-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="input-field"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                   {[
    { id: 'card' as const, label: 'Card', icon: '💳' },
    { id: 'paypal' as const, label: 'PayPal', icon: '🔵' },
    { id: 'upi' as const, label: 'UPI', icon: '📱' },
  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Donate Button */}
              <button
                type="submit"
                disabled={isProcessing || (!amount && !customAmount)}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Contribute Now
                  </>
                )}
              </button>

              <p className="text-center text-xs text-text-light mt-4">
                Your contribution is secure and encrypted.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
