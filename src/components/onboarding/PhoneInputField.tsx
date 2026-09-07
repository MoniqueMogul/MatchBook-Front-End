import React, { forwardRef, useId } from 'react';
import './OnboardingComponents.css';

interface PhoneInputFieldProps {
  label: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  error?: string;
  id?: string;
}

const COUNTRY_CODES = [
  { value: '+1', label: '+1' },
  { value: '+44', label: '+44' },
  { value: '+91', label: '+91' },
  { value: '+61', label: '+61' },
  { value: '+49', label: '+49' },
  { value: '+33', label: '+33' },
  { value: '+81', label: '+81' },
  { value: '+86', label: '+86' },
];

/**
 * Formats a raw digit string into 000-000-0000 pattern.
 */
function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const PhoneInputField = forwardRef<HTMLInputElement, PhoneInputFieldProps>(
  ({ label, countryCode, onCountryCodeChange, phoneValue, onPhoneChange, error, id }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      onPhoneChange(formatted);
    };

    return (
      <div className="ob-field">
        <label className="ob-field__label" htmlFor={inputId}>
          {label}
        </label>
        <div className="ob-phone">
          <div className="ob-phone__code-wrapper">
            <select
              className="ob-phone__code-select"
              value={countryCode}
              onChange={(e) => onCountryCodeChange(e.target.value)}
              aria-label="Country calling code"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <input
            ref={ref}
            id={inputId}
            type="tel"
            className={`ob-phone__number-input ${error ? 'ob-phone__number-input--error' : ''}`}
            placeholder="000-000-0000"
            value={phoneValue}
            onChange={handlePhoneChange}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        </div>
        {error && (
          <span className="ob-field__error" id={`${inputId}-error`} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

PhoneInputField.displayName = 'PhoneInputField';
