import React, { forwardRef, useId } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text */
  label: string;
  /** Validation error message */
  error?: string;
}

/**
 * TextInput — accessible text field with label association.
 *
 * Figma layer: Text Input > Label + Frame (Input Box) + Placeholder text
 * Border: neutral/200, rounded-lg, px-3, py-2.5
 * Font: Plus Jakarta Sans, 14px, 400
 */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className, id: propId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = propId ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="onboarding-field">
        <label className="onboarding-field__label" htmlFor={inputId}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`onboarding-field__input ${error ? 'onboarding-field__input--error' : ''} ${className ?? ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          {...props}
        />
        {error && (
          <span id={errorId} className="onboarding-field__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
export default TextInput;
