"use client";

import { useEffect, useState } from "react";

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

export default function BuyerProfilePage() {
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [preferences, setPreferences] =
    useState<BuyerPreferences | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, preferencesData] =
          await Promise.all([
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

  const preferredRegions =
    preferences?.target_locations?.map(
      (targetLocation) => targetLocation.display_name,
    ) ?? [];

  const industriesOfInterest =
    preferences?.target_industries ?? [];

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
            location={location}
            memberType={memberType}
            preferredRegions={preferredRegions}
            industriesOfInterest={industriesOfInterest}
          />
        )}
      </div>
    </div>
  );
}