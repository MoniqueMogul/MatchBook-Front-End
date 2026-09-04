import React, { forwardRef } from 'react';
import './FormComponents.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => {
  return (
    <div className="form-group">
      {label && <label className="form-group__label">{label}</label>}
      <input ref={ref} className={`form-group__input ${error ? 'form-group__input--error' : ''}`} {...props} />
      {error && <span className="form-group__error">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';