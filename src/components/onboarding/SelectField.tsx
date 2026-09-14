import React, { forwardRef, useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Visible label text */
  label: string;
  /** Dropdown options */
  options: SelectOption[];
  /** Placeholder option text (shown when no value selected) */
  placeholder?: string;
  /** Validation error message */
  error?: string;
}

/**
 * SelectField — native <select> with custom chevron and label.
 *
 * Figma layer: Select > Label + Frame (dropdown chevron)
 * Border: neutral/200, rounded-lg, appearance: none with custom SVG chevron
 */
const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, placeholder, error, className, id: propId, ...props }, ref) => {
    const generatedId = useId();
    const selectId = propId ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="onboarding-select">
        <label className="onboarding-select__label" htmlFor={selectId}>
          {label}
        </label>
        <div className="onboarding-select__wrapper">
          <select
            ref={ref}
            id={selectId}
            className={`onboarding-select__native ${error ? 'onboarding-select__native--error' : ''} ${className ?? ''}`}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId}
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
          {/* Chevron icon */}
          <svg
            className="onboarding-select__chevron"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {error && (
          <span id={errorId} className="onboarding-select__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
export default SelectField;
