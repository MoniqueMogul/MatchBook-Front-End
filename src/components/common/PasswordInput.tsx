import React, { forwardRef, useState } from 'react';
import './FormComponents.css';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ label, error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-group">
      {label && <label className="form-group__label">{label}</label>}
      <div className="form-group__password-wrapper">
        <input 
          ref={ref} 
          type={showPassword ? 'text' : 'password'} 
          className={`form-group__input ${error ? 'form-group__input--error' : ''}`} 
          {...props} 
        />
        <button type="button" className="form-group__toggle" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <span className="form-group__error">{error}</span>}
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';