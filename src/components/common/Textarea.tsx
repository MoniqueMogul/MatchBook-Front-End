import React, { forwardRef } from 'react';
import './FormComponents.css';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-group__label">{label}</label>}
        <textarea
          ref={ref}
          className={`form-group__textarea ${
            error ? 'form-group__input--error' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="form-group__error">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';