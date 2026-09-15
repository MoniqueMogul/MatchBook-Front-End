"use client";

import { Settings2 } from "lucide-react";
import "./ProfileHeader.css";

export type ProfileMode = "preview" | "edit";

interface ProfileHeaderProps {
  profileMode?: ProfileMode;
  onProfileModeChange?: (mode: ProfileMode) => void;
  imageSrc?: string;
}

export default function ProfileHeader({
  profileMode = "preview",
  onProfileModeChange,
  imageSrc,
}: ProfileHeaderProps) {
  return (
    <header className="profile-header">
      <div className="profile-header__identity">
        <div className="profile-header__image-wrapper">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Profile"
              className="profile-header__image"
            />
          ) : (
            <div
              className="profile-header__image-placeholder"
              aria-label="Profile image"
            />
          )}
        </div>

        <div className="profile-header__details">
          <div className="profile-header__name-row">
            <h1 className="profile-header__name">Profile Name</h1>

            <span className="profile-header__badge">
              <span className="profile-header__badge-label">Verified</span>
            </span>
          </div>

          <div className="profile-header__meta">
            <span>Location</span>

            <span
              className="profile-header__dot"
              aria-hidden="true"
            />

            <span>Member Type</span>
          </div>
        </div>
      </div>

      <div className="profile-header__separator" />

      <div className="profile-header__actions">
        <div className="profile-header__toggle">
          <button
            type="button"
            className={`profile-header__toggle-button ${
              profileMode === "preview"
                ? "profile-header__toggle-button--active-left"
                : "profile-header__toggle-button--inactive"
            }`}
            onClick={() => onProfileModeChange?.("preview")}
            aria-pressed={profileMode === "preview"}
          >
            Profile Preview
          </button>

          <button
            type="button"
            className={`profile-header__toggle-button ${
              profileMode === "edit"
                ? "profile-header__toggle-button--active-right"
                : "profile-header__toggle-button--inactive"
            }`}
            onClick={() => onProfileModeChange?.("edit")}
            aria-pressed={profileMode === "edit"}
          >
            Profile Edit
          </button>
        </div>

        <button
          type="button"
          className="profile-header__settings"
          aria-label="Account settings"
        >
          <Settings2 size={24} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}