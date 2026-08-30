'use client';

import { useState } from 'react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'number';
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  rows = 4,
}: FormInputProps) {
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-secondary mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          rows={rows}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field resize-none"
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field"
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
