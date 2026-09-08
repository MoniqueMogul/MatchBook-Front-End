"use client";

import { Pencil } from "lucide-react";
import "./ProfileEditHeader.css";

interface ProfileEditHeaderProps {
  name: string;
  location: string;
  imageSrc?: string;
  onLocationChange: (value: string) => void;
  onImageEdit?: () => void;
  onPreview?: () => void;
  disabled?: boolean;
}

export default function ProfileEditHeader({
  name,
  location,
  imageSrc,
  onLocationChange,
  onImageEdit,
  onPreview,
  disabled = false,
}: ProfileEditHeaderProps) {
  return (
    <section className="profile-edit-header">
      <div className="profile-edit-header__identity">
        <div className="profile-edit-header__image-wrapper">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Profile"
              className="profile-edit-header__image"
            />
          ) : (
            <div
              className="profile-edit-header__image-placeholder"
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            className="profile-edit-header__image-edit"
            onClick={onImageEdit}
            disabled={disabled}
            aria-label="Edit profile image"
          >
            <Pencil size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="profile-edit-header__fields">
          <div className="profile-edit-header__field">
            <label
              htmlFor="profile-edit-name"
              className="profile-edit-header__label"
            >
              Name
            </label>

            <input
              id="profile-edit-name"
              type="text"
              className="profile-edit-header__input profile-edit-header__input--disabled"
              value={name}
              disabled
              readOnly
            />
          </div>

          <div className="profile-edit-header__field">
            <label
              htmlFor="profile-edit-location"
              className="profile-edit-header__label"
            >
              Location
            </label>

            <input
              id="profile-edit-location"
              type="text"
              className="profile-edit-header__input"
              value={location}
              onChange={(event) =>
                onLocationChange(event.target.value)
              }
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="profile-edit-header__controls">
        <div className="profile-edit-header__mode-toggle">
          <button
            type="button"
            className="profile-edit-header__mode-button"
            onClick={onPreview}
            disabled={disabled}
          >
            Preview
          </button>

          <button
            type="button"
            className="profile-edit-header__mode-button profile-edit-header__mode-button--active"
            disabled
          >
            Profile Edit
          </button>
        </div>
      </div>
    </section>
  );
}