"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import BuyerProfilePreview from "@/components/buyer/profile/BuyerProfilePreview";

import {
  getBuyerPreferences,
  type BuyerPreferences,
} from "@/lib/api/buyerPreferences";

import {
  getBuyerProfile,
  type BuyerProfile,
} from "@/lib/api/buyer";

import "./page.css";

/*
 * TEMPORARY UI DEVELOPMENT MODE
 *
 * Keep this true while we are building/testing
 * the profile UI visually.
 *
 * Change to false when we are ready to reconnect
 * the real backend/Supabase data.
 */
const USE_MOCK_PROFILE = true;

const MOCK_PROFILE: BuyerProfile = {
  id: "mock-buyer-profile-id",
  user_id: "mock-user-id",
  about_me: "",
  buyer_type: "first_time_owner",

  current_industry: "Technology",
  current_position: "Founder",
  business_experience_years: 5,
  relevant_experience:
    "Experience in technology, product development, and business operations.",
  available_hours_per_week: 40,

  city: "Hyderabad",
  county: null,
  state: "Telangana",
  zip_code: "500039",

  verification_status: "verified",

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_PREFERENCES: BuyerPreferences = {
  target_industry_preferences: [
    {
      industry: "Technology",
      sub_industries: [],
    },
    {
      industry: "Health & Wellness",
      sub_industries: [],
    },
    {
      industry: "Home & Professional Services",
      sub_industries: [],
    },
  ],

  target_business_models: [],
  target_business_types: [],

  target_locations: [
    {
      provider: "locationiq",
      place_id: "mock-hyderabad",
      latitude: 17.4065,
      longitude: 78.4772,
      display_name: "Hyderabad, Telangana",
    },
    {
      provider: "locationiq",
      place_id: "mock-austin",
      latitude: 30.2672,
      longitude: -97.7431,
      display_name: "Austin, Texas",
    },
    {
      provider: "locationiq",
      place_id: "mock-dallas",
      latitude: 32.7767,
      longitude: -96.797,
      display_name: "Dallas, Texas",
    },
  ],

  minimum_years_in_operation: 5,

  minimum_required_arr: 500000,

  minimum_required_sde: 150000,

  maximum_purchase_price: 2000000,

  preferred_arr: 750000,

  preferred_sde: 200000,

  preferred_owner_hours_per_week: 40,

  required_transition_training_days: 14,

  deal_preference: "either",

  real_estate_preference: "included",

  accepts_customer_concentration_above_25_percent: false,

  preferred_acquisition_timeline: "within-1-12",
};

function BuyerProfilePageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const validPreviewTabs = [
    "overview",
    "industry-experience",
    "acquisition-preferences",
    "finances",
  ] as const;

  const initialTab = validPreviewTabs.includes(
    tabParam as (typeof validPreviewTabs)[number],
  )
    ? (tabParam as (typeof validPreviewTabs)[number])
    : "overview";

  const [profile, setProfile] =
    useState<BuyerProfile | null>(
      USE_MOCK_PROFILE ? MOCK_PROFILE : null,
    );

  const [preferences, setPreferences] =
    useState<BuyerPreferences | null>(
      USE_MOCK_PROFILE ? MOCK_PREFERENCES : null,
    );

  const [loading, setLoading] =
    useState(!USE_MOCK_PROFILE);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_PROFILE) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          profileData,
          preferencesData,
        ] = await Promise.all([
          getBuyerProfile(),
          getBuyerPreferences(),
        ]);

        if (!cancelled) {
          setProfile(profileData);
          setPreferences(preferencesData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load buyer profile.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const location =
    [profile?.city, profile?.state]
      .filter(Boolean)
      .join(", ") || "Location";

  const memberType =
    profile?.buyer_type || "Member Type";

  return (
    <div className="buyer-profile-page">
      <DashboardSidebar />

      <div className="buyer-profile-page__main">
        {loading ? (
          <div className="buyer-profile-page__loading">
            <p>Loading profile...</p>
          </div>
        ) : error ? (
          <div
            className="buyer-profile-page__error"
            role="alert"
          >
            {error}
          </div>
        ) : (
          <BuyerProfilePreview
            profile={profile}
            location={location}
            memberType={memberType}
            preferences={preferences}
            initialTab={initialTab}
          />
        )}
      </div>
    </div>
  );
}

export default function BuyerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="buyer-profile-page__loading">
          <p>Loading profile...</p>
        </div>
      }
    >
      <BuyerProfilePageContent />
    </Suspense>
  );
}