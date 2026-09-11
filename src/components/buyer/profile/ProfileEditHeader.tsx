"use client";

import { Pencil } from "lucide-react";
import "./ProfileEditHeader.css";

interface ProfileEditHeaderProps {
  name: string;
  location: string;
  imageSrc?: string;
  mode?: "preview" | "edit";
  onModeChange?: (mode: "preview" | "edit") => void;
  onPreview?: () => void;
  onImageChange?: () => void;
  onLocationChange?: (value: string) => void;
}

export default function ProfileEditHeader({
  name,
  location,
  imageSrc,
  mode = "edit",
  onModeChange,
  onPreview,
  onImageChange,
  onLocationChange,
}: ProfileEditHeaderProps) {
  return (
    <header className="profile-edit-header">
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
              className="profile-edit-header__image profile-edit-header__image--placeholder"
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            className="profile-edit-header__image-edit"
            onClick={onImageChange}
            aria-label="Change profile image"
          >
            <Pencil size={16} strokeWidth={2} />
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
              className="profile-edit-header__input"
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
                onLocationChange?.(event.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="profile-edit-header__controls">
        <div
          className="profile-edit-header__toggle"
          role="group"
          aria-label="Profile view mode"
        >
          <button
            type="button"
            className={`profile-edit-header__toggle-button ${
              mode === "preview"
                ? "profile-edit-header__toggle-button--active"
                : ""
            }`}
            onClick={() => {
              onPreview?.();
              onModeChange?.("preview");
            }}
          >
            Preview
          </button>

          <button
            type="button"
            className={`profile-edit-header__toggle-button ${
              mode === "edit"
                ? "profile-edit-header__toggle-button--active"
                : ""
            }`}
            onClick={() => onModeChange?.("edit")}
          >
            Profile Edit
          </button>
        </div>
      </div>
    </header>
  );
}
