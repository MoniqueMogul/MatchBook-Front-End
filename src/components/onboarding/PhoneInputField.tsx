import React, { forwardRef, useId } from 'react';

interface PhoneInputFieldProps {
  /** Visible label text */
  label: string;
  /** Current country code value (e.g. "+1") */
  countryCodeValue: string;
  /** Callback when country code changes */
  onCountryCodeChange: (value: string) => void;
  /** Validation error message (for the phone number) */
  error?: string;
  /** Props forwarded to the phone number <input> via ref */
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
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
  { value: '+55', label: '+55' },
  { value: '+52', label: '+52' },
];

/**
 * PhoneInputField — split phone input with country code selector + number input.
 *
 * Figma layer: number field > Country code dropdown (+1, ~80px) + Phone input (000-000-0000)
 */
const PhoneInputField = forwardRef<HTMLInputElement, PhoneInputFieldProps>(
  (
    {
      label,
      countryCodeValue,
      onCountryCodeChange,
      error,
      name,
      value,
      onChange,
      onBlur,
      placeholder = '000-000-0000',
    },
    ref
  ) => {
    const generatedId = useId();
    const numberId = `${generatedId}-number`;
    const codeId = `${generatedId}-code`;
    const errorId = error ? `${numberId}-error` : undefined;

    return (
      <div className="phone-input">
        <label className="phone-input__label" htmlFor={numberId}>
          {label}
        </label>
        <div className="phone-input__row">
          <div className="phone-input__code-wrapper">
            <select
              id={codeId}
              className="phone-input__code-select"
              value={countryCodeValue}
              onChange={(e) => onCountryCodeChange(e.target.value)}
              aria-label="Country calling code"
            >
              {COUNTRY_CODES.map((code) => (
                <option key={code.value} value={code.value}>
                  {code.label}
                </option>
              ))}
            </select>
          </div>
          <input
            ref={ref}
            id={numberId}
            name={name}
            type="tel"
            className={`phone-input__number ${error ? 'phone-input__number--error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId}
          />
        </div>
        {error && (
          <span id={errorId} className="phone-input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

PhoneInputField.displayName = 'PhoneInputField';
export default PhoneInputField;
