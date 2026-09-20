"use client";

import type { BuyerProfile } from "@/lib/api/buyer";

import "./ExperienceCredentialsPreview.css";

interface ExperienceCredentialsPreviewProps {
  profile: BuyerProfile | null;
}

const BUYER_TYPE_LABELS: Record<
  BuyerProfile["buyer_type"],
  string
> = {
  first_time_owner: "First-time Owner",
  existing_business_owner: "Existing Business Owner",
  investor_group: "Investor Group",
  family_office: "Family Office",
  private_equity: "Private Equity",
};

function displayValue(
  value: string | number | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not provided";
  }

  return String(value);
}

export default function ExperienceCredentialsPreview({
  profile,
}: ExperienceCredentialsPreviewProps) {
  if (!profile) {
    return (
      <section className="experience-credentials-preview">
        <p className="experience-credentials-preview__empty">
          No experience information available.
        </p>
      </section>
    );
  }

  return (
    <section className="experience-credentials-preview">
      {/* Buyer Type */}

      <div className="experience-credentials-preview__section">
        <h2 className="experience-credentials-preview__title">
          Buyer Type
        </h2>

        <span className="experience-credentials-preview__pill">
          {BUYER_TYPE_LABELS[profile.buyer_type]}
        </span>
      </div>

      {/* Current Industry */}

      <div className="experience-credentials-preview__section">
        <h2 className="experience-credentials-preview__title">
          Current Industry
        </h2>

        <p className="experience-credentials-preview__value">
          {displayValue(profile.current_industry)}
        </p>
      </div>

      {/* Current Position */}

      <div className="experience-credentials-preview__section">
        <h2 className="experience-credentials-preview__title">
          Current Position
        </h2>

        <p className="experience-credentials-preview__value">
          {displayValue(profile.current_position)}
        </p>
      </div>

      {/* Business Experience */}

      <div className="experience-credentials-preview__section">
        <h2 className="experience-credentials-preview__title">
          Years of Business Experience
        </h2>

        <p className="experience-credentials-preview__value">
          {profile.business_experience_years != null
            ? `${profile.business_experience_years} ${
                profile.business_experience_years === 1
                  ? "year"
                  : "years"
              }`
            : "Not provided"}
        </p>
      </div>

      {/* Relevant Experience */}

      <div className="experience-credentials-preview__section">
        <h2 className="experience-credentials-preview__title">
          Relevant Experience
        </h2>

        <p className="experience-credentials-preview__description">
          {displayValue(profile.relevant_experience)}
        </p>
      </div>

      {/* Available Hours */}

      <div className="experience-credentials-preview__section">
        <h2 className="experience-credentials-preview__title">
          Available Hours per Week
        </h2>

        <p className="experience-credentials-preview__value">
          {profile.available_hours_per_week != null
            ? `${profile.available_hours_per_week} hours`
            : "Not provided"}
        </p>
      </div>

      {/* Current Location */}

      <div className="experience-credentials-preview__section">
        <h2 className="experience-credentials-preview__title">
          Current Location
        </h2>

        <div className="experience-credentials-preview__pills">
          {profile.city && (
            <span className="experience-credentials-preview__pill">
              {profile.city}
            </span>
          )}

          {profile.county && (
            <span className="experience-credentials-preview__pill">
              {profile.county}
            </span>
          )}

          {profile.state && (
            <span className="experience-credentials-preview__pill">
              {profile.state}
            </span>
          )}

          {profile.zip_code && (
            <span className="experience-credentials-preview__pill">
              {profile.zip_code}
            </span>
          )}

          {!profile.city &&
            !profile.county &&
            !profile.state &&
            !profile.zip_code && (
              <span className="experience-credentials-preview__empty">
                Not provided
              </span>
            )}
        </div>
      </div>
    </section>
  );
}