"use client";

import "./ProfileAboutField.css";

interface ProfileAboutFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function ProfileAboutField({
  value,
  onChange,
  placeholder = "Placeholder text for a longer response, spanning multiple lines.",
  error,
  disabled = false,
}: ProfileAboutFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className="profile-about-field">
      <label
        htmlFor="profile-about"
        className="profile-about-field__label"
      >
        About
      </label>

      <textarea
        id="profile-about"
        className={`profile-about-field__textarea ${
          hasError
            ? "profile-about-field__textarea--error"
            : ""
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
      />

      {hasError && (
        <p
          className="profile-about-field__helper"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}