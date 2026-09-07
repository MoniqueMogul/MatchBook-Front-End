import React, { forwardRef, useId } from 'react';
import './OnboardingComponents.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, placeholder, error, id, value, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const isPlaceholder = !value || value === '';

    return (
      <div className="ob-field">
        <label className="ob-field__label" htmlFor={selectId}>
          {label}
        </label>
        <div className="ob-select-wrapper">
          <select
            ref={ref}
            id={selectId}
            value={value}
            className={`ob-select-wrapper__select ${error ? 'ob-select-wrapper__select--error' : ''} ${isPlaceholder ? 'ob-select-wrapper__select--placeholder' : ''}`}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="ob-select-wrapper__chevron" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        {error && (
          <span className="ob-field__error" id={`${selectId}-error`} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
