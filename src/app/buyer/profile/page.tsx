
"use client";

import { Suspense, useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

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

import {
  getCurrentUser,
  type UserPersonal,
} from "@/lib/api/user";

import { useBuyerOnboardingStore } from "@/store/useBuyerOnboardingStore";

import "./page.css";

function BuyerProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onboardingInProgress =
    useBuyerOnboardingStore(
      (state) => state.onboardingInProgress,
    );

  useEffect(() => {
    if (onboardingInProgress) {
      router.replace("/buyer-onboarding/profile");
    }
  }, [onboardingInProgress, router]);

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
    useState<BuyerProfile | null>(null);

  const [preferences, setPreferences] =
    useState<BuyerPreferences | null>(null);

  const [user, setUser] =
    useState<UserPersonal | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          profileData,
          preferencesData,
          userData,
        ] = await Promise.all([
          getBuyerProfile(),
          getBuyerPreferences(),
          getCurrentUser(),
        ]);

        if (!cancelled) {
          setProfile(profileData);
          setPreferences(preferencesData);
          setUser(userData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load buyer profile and preferences.",
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

  if (onboardingInProgress) {
    return null;
  }

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
            phone={user?.phone}
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

