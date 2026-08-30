'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProgressBarProps {
  current: number;
  goal: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient';
}

export default function ProgressBar({
  current,
  goal,
  showLabel = true,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const labelClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="w-full">
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            variant === 'gradient'
              ? 'bg-gradient-to-r from-primary to-primary-light shadow-glow'
              : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className={`flex justify-between mt-2 text-text-light ${labelClasses[size]}`}>
          <span>
            ${current.toLocaleString()} raised
          </span>
          <span className="font-medium">
            {percentage.toFixed(0)}%
          </span>
          <span>
            Goal: ${goal.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
