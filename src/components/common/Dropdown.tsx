'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './FormComponents.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function Dropdown({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="form-group" ref={wrapperRef}>
      {label && <label className="form-group__label">{label}</label>}

      <div className="form-group__dropdown-wrap">
        <button
          type="button"
          className={`form-group__dropdown-trigger ${
            open ? 'form-group__dropdown-trigger--open' : ''
          } ${error ? 'form-group__input--error' : ''}`}
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
          aria-expanded={open}
        >
          <span className={selected ? '' : 'form-group__dropdown-placeholder'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={1.8}
            className={`form-group__dropdown-chevron ${
              open ? 'form-group__dropdown-chevron--open' : ''
            }`}
          />
        </button>

        {open && (
          <div className="form-group__dropdown-menu">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`form-group__dropdown-option ${
                    isSelected ? 'form-group__dropdown-option--selected' : ''
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <span className="form-group__error">{error}</span>}
    </div>
  );
}