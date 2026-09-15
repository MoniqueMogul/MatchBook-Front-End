"use client";

import { useRouter } from "next/navigation";
import { UserRoundCog } from "lucide-react";

import "./BuyerProfilePreview.css";

interface BuyerProfilePreviewProps {
  name?: string;
  location?: string;
  memberType?: string;
  imageSrc?: string;
  about?: string;
  preferredRegions?: string[];
  industriesOfInterest?: string[];
}

export default function BuyerProfilePreview({
  name = "Profile Name",
  location = "Location",
  memberType = "Member Type",
  imageSrc,
  about = "lorem ipsum dolor sit amet consectetur adipiscing elit omnis fuga quo laboris magna blanditiis est harum magna aliqua ipsum qui maxime lorem odio atque laboris veniam excepteur molestias tempor vel sunt lorem ipsum dolor sit amet consectetur adipiscing elit omnis fuga quo laboris magna blanditiis est harum magna aliqua ipsum qui maxime lorem odio atque laboris veniam excepteur molestias tempor vel sunt",
  preferredRegions = [
    "Location 1",
    "Location 3",
    "Location 2",
  ],
  industriesOfInterest = [
    "Placeholder text",
    "Placeholder text",
    "Placeholder text",
  ],
}: BuyerProfilePreviewProps) {
  const router = useRouter();

  return (
    <main className="buyer-profile-preview">
      <div className="buyer-profile-preview__content">

        {/* =========================
            Profile Header
           ========================= */}

        <section className="buyer-profile-preview__header">

          {/* Profile identity */}
          <div className="buyer-profile-preview__identity">

            <div className="buyer-profile-preview__image-wrapper">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={`${name} profile`}
                  className="buyer-profile-preview__image"
                />
              ) : (
                <div
                  className="buyer-profile-preview__image buyer-profile-preview__image--placeholder"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="buyer-profile-preview__identity-details">

              <div className="buyer-profile-preview__name-row">
                <h1 className="buyer-profile-preview__name">
                  {name}
                </h1>

                <span className="buyer-profile-preview__verified">
                  Verified
                </span>
              </div>

              <div className="buyer-profile-preview__meta">
                <span>{location}</span>

                <span
                  className="buyer-profile-preview__meta-separator"
                  aria-hidden="true"
                >
                  •
                </span>

                <span>{memberType}</span>
              </div>

            </div>
          </div>

          {/* Header controls */}
          <div className="buyer-profile-preview__controls">

            <div
              className="buyer-profile-preview__mode-toggle"
              role="group"
              aria-label="Profile view mode"
            >
              <button
                type="button"
                className="buyer-profile-preview__mode-button buyer-profile-preview__mode-button--active"
              >
                Profile Preview
              </button>

              <button
                type="button"
                className="buyer-profile-preview__mode-button"
                onClick={() => router.push("/buyer/profile/edit")}
              >
                Profile Edit
              </button>
            </div>

            <button
              type="button"
              className="buyer-profile-preview__settings-button"
              aria-label="Profile settings"
            >
              <UserRoundCog
                size={22}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </button>

          </div>
        </section>

        {/* =========================
            Profile Tabs
           ========================= */}

        <nav
          className="buyer-profile-preview__tabs"
          aria-label="Profile sections"
        >
          <button
            type="button"
            className="buyer-profile-preview__tab buyer-profile-preview__tab--active"
          >
            Overview
          </button>

          <button
            type="button"
            className="buyer-profile-preview__tab"
          >
            Industry Background
          </button>

          <button
            type="button"
            className="buyer-profile-preview__tab"
          >
            Acquisition Preferences
          </button>

          <button
            type="button"
            className="buyer-profile-preview__tab"
          >
            Finances
          </button>
        </nav>

        {/* =========================
            Overview
           ========================= */}

        <section className="buyer-profile-preview__overview-card">

          {/* About */}
          <div className="buyer-profile-preview__section">

            <h2 className="buyer-profile-preview__section-title">
              About
            </h2>

            <p className="buyer-profile-preview__about">
              {about}
            </p>

          </div>

          {/* Preferred Regions */}
          <div className="buyer-profile-preview__section">

            <h2 className="buyer-profile-preview__section-title">
              Preferred Regions
            </h2>

            <div className="buyer-profile-preview__pills">
              {preferredRegions.map((region, index) => (
                <span
                  key={`${region}-${index}`}
                  className="buyer-profile-preview__pill"
                >
                  {region}
                </span>
              ))}
            </div>

          </div>

          {/* Industries */}
          <div className="buyer-profile-preview__section">

            <h2 className="buyer-profile-preview__section-title">
              Industries of Interest
            </h2>

            <div className="buyer-profile-preview__pills">
              {industriesOfInterest.map((industry, index) => (
                <span
                  key={`${industry}-${index}`}
                  className="buyer-profile-preview__pill"
                >
                  {industry}
                </span>
              ))}
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}