"use client";

import React, { forwardRef } from "react";
import "./FormComponents.css";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  options: DropdownOption[];
  onChange?: (value: string) => void;
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, error, options, onChange, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-group__label">{label}</label>}
        <select
          ref={ref}
          className={`form-group__input ${error ? "form-group__input--error" : ""}`}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="form-group__error">{error}</span>}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
