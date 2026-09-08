"use client";

import { useId } from "react";
import "./ProfileAboutField.css";

interface ProfileAboutFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function ProfileAboutField({
  value,
  onChange,
  error,
  disabled = false,
  required = true,
}: ProfileAboutFieldProps) {
  const generatedId = useId();
  const textareaId = `profile-about-${generatedId}`;
  const errorId = `${textareaId}-error`;

  const hasError = Boolean(error);

  return (
    <div className="profile-about-field">
      <label
        htmlFor={textareaId}
        className="profile-about-field__label"
      >
        About
      </label>

      <textarea
        id={textareaId}
        className={`profile-about-field__textarea ${
          hasError ? "profile-about-field__textarea--error" : ""
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />

      {hasError && (
        <p
          id={errorId}
          className="profile-about-field__helper"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}