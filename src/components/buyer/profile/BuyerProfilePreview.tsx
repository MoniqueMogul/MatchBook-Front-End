"use client";

import type { BuyerPreferences } from "@/lib/api/buyerPreferences";
import type { BuyerProfile } from "@/lib/api/buyer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRoundCog } from "lucide-react";
import AcquisitionPreferencesPreview from "./AcquisitionPreferencesPreview";
import ExperienceCredentialsPreview from "./ExperienceCredentialsPreview";
import FinancePreview from "./FinancePreview";
import "./BuyerProfilePreview.css";

type PreviewTab =
  | "overview"
  | "industry-experience"
  | "acquisition-preferences"
  | "finances";

const BUYER_TYPE_LABELS: Record<string, string> = {
  first_time_owner: "First-time Owner",
  existing_business_owner: "Existing Business Owner",
  investor_group: "Investor Group",
  family_office: "Family Office",
  private_equity: "Private Equity",
};

function formatBuyerType(value: string): string {
  return BUYER_TYPE_LABELS[value] ?? value;
}

interface BuyerProfilePreviewProps {
  name?: string;
  location?: string;
  memberType?: string;
  imageSrc?: string;
  phone?: string | null;
  preferences?: BuyerPreferences;
  profile?: BuyerProfile | null;
  initialTab?: PreviewTab;
}

export default function BuyerProfilePreview({
  name = "Profile Name",
  location = "Location",
  memberType = "Member Type",
  imageSrc,
  phone,
  preferences,
  profile,
  initialTab = "overview",
}: BuyerProfilePreviewProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<PreviewTab>(initialTab);

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

                <span>{formatBuyerType(memberType)}</span>
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
            className={`buyer-profile-preview__tab ${
              activeTab === "overview"
                ? "buyer-profile-preview__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            type="button"
            className={`buyer-profile-preview__tab ${
              activeTab === "industry-experience"
                ? "buyer-profile-preview__tab--active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("industry-experience")
            }
          >
            Experience & Credentials
          </button>

          <button
            type="button"
            className={`buyer-profile-preview__tab ${
              activeTab === "acquisition-preferences"
                ? "buyer-profile-preview__tab--active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("acquisition-preferences")
            }
          >
            Acquisition Preferences
          </button>

          <button
            type="button"
            className={`buyer-profile-preview__tab ${
              activeTab === "finances"
                ? "buyer-profile-preview__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("finances")}
          >
            Finances
          </button>
        </nav>

        {/* =========================
            Overview
           ========================= */}

        {activeTab === "overview" && (
          <section className="buyer-profile-preview__overview-card">

            <div className="buyer-profile-preview__section">
              <h2 className="buyer-profile-preview__section-title">
                About
              </h2>

              <p className="buyer-profile-preview__value">
                {profile?.about_me ||
                  "No information provided yet."}
              </p>
            </div>

            <div className="buyer-profile-preview__section">
              <h2 className="buyer-profile-preview__section-title">
                Contact
              </h2>

              <p className="buyer-profile-preview__value">
                {phone || "No phone number provided."}
              </p>
            </div>

          </section>
        )}

        {/* =========================
            Acquisition Preferences
           ========================= */}

        {activeTab === "acquisition-preferences" && (
          <section className="buyer-profile-preview__overview-card">

            <AcquisitionPreferencesPreview
              data={{
                industries:
                  preferences?.target_industry_preferences?.map(
                    (item) => item.industry,
                  ) ?? [],

                subIndustries:
                  preferences?.target_industry_preferences?.flatMap(
                    (item) => item.sub_industries ?? [],
                  ) ?? [],

                businessModels:
                  preferences?.target_business_models ?? [],

                businessTypes:
                  preferences?.target_business_types ?? [],

                targetLocations:
                  preferences?.target_locations ?? [],

                minimumYearsInOperation:
                  preferences?.minimum_years_in_operation,

                minimumARR:
                  preferences?.minimum_required_arr,

                minimumSDE:
                  preferences?.minimum_required_sde,

                maximumPurchasePrice:
                  preferences?.maximum_purchase_price,

                preferredARR:
                  preferences?.preferred_arr,

                preferredSDE:
                  preferences?.preferred_sde,

                preferredOwnerHoursPerWeek:
                  preferences?.preferred_owner_hours_per_week,

                customerConcentration:
                  preferences?.accepts_customer_concentration_above_25_percent,

                sellerTrainingDays:
                  preferences?.required_transition_training_days,

                dealPreference:
                  preferences?.deal_preference,

                realEstatePreference:
                  preferences?.real_estate_preference,

                timeline:
                  preferences?.preferred_acquisition_timeline as
                    | "exploring"
                    | "within-1-12"
                    | "within-12-24"
                    | "within-24-plus"
                    | null
                    | undefined,
              }}
            />

          </section>
        )}

        {/* =========================
            Experience & Credentials
           ========================= */}

        {activeTab === "industry-experience" && (
          <section className="buyer-profile-preview__overview-card">

            <ExperienceCredentialsPreview
              profile={profile ?? null}
            />

          </section>
        )}

        {/* =========================
            Finances
           ========================= */}

        {activeTab === "finances" && (
          <section className="buyer-profile-preview__overview-card">

            <FinancePreview
              data={{
                purchasePrice:
                  preferences?.maximum_purchase_price ?? null,
              }}
            />

          </section>
        )}

      </div>
    </main>
  );
}