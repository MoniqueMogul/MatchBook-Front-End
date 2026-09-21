'use client';

import { Check } from 'lucide-react';
import './FormComponents.css';

export interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  columns?: 1 | 2 | 3;
}

export function CheckboxGroup({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  columns = 1,
}: CheckboxGroupProps) {
  const toggle = (v: string) => {
    if (disabled) return;
    onChange(
      value.includes(v)
        ? value.filter((item) => item !== v)
        : [...value, v]
    );
  };

  return (
    <div className="form-group">
      {label && <label className="form-group__label">{label}</label>}

      <div
        className={`form-group__checkbox-grid form-group__checkbox-grid--cols-${columns}`}
      >
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <label key={opt.value} className="form-group__checkbox-option">
              <span
                className={`form-group__checkbox ${
                  checked ? 'form-group__checkbox--checked' : ''
                }`}
              >
                {checked && <Check size={12} strokeWidth={3} />}
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
                disabled={disabled}
                className="form-group__checkbox-hidden"
              />
              <span className="form-group__checkbox-label">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {error && <span className="form-group__error">{error}</span>}
    </div>
  );
}