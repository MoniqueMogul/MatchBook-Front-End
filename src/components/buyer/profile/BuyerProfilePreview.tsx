"use client";

import { useRouter } from "next/navigation";
import { UserRoundCog } from "lucide-react";

import "./BuyerProfilePreview.css";

interface BuyerProfilePreviewProps {
  name?: string;
  location?: string;
  memberType?: string;
  imageSrc?: string;
  preferredRegions?: string[];
  industriesOfInterest?: string[];
}

export default function BuyerProfilePreview({
  name = "Profile Name",
  location = "Location",
  memberType = "Member Type",
  imageSrc,
  preferredRegions = [],
  industriesOfInterest = [],
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

            <div className="buyer-profile-preview__actions">
              <button
                type="button"
                className="buyer-profile-preview__edit-button"
                onClick={() => router.push("/buyer/profile/edit")}
              >
                Edit
              </button>

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
            Experience & Credentials
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