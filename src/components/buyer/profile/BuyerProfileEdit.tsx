"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import IndustryExperienceSection from "./IndustryExperienceSection";
import AcquisitionPreferencesSection from "./AcquisitionPreferencesSection";
import ProfileEditHeader from "./ProfileEditHeader";
import ProfileImageModal from "./ProfileImageModal";
import ProfileTabs, {
  type ProfileTab,
} from "./ProfileTabs";
import EditOverviewSection from "./EditOverviewSection";
import ProfileFormActions from "./ProfileFormActions";

import {
  getBuyerPreferences,
  saveBuyerPreferences,
  type BuyerPreferences,
  type BuyerPreferencesPayload,
} from "@/lib/api/buyerPreferences";

import "./BuyerProfileEdit.css";

export default function BuyerProfileEdit() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("overview");

  /*
   * Backend preference data.
   */
  const [preferences, setPreferences] =
    useState<BuyerPreferences | null>(null);

  /*
   * Loading state for initial GET.
   */
  const [loading, setLoading] =
    useState(true);

  /*
   * Saving state for final PUT.
   */
  const [saving, setSaving] =
    useState(false);

  /*
   * Error shown to the user if API fails.
   */
  const [error, setError] =
    useState<string | null>(null);

  /*
   * About is currently frontend-only.
   *
   * IMPORTANT:
   * There is no backend `about` field in the
   * current BuyerPreferences schema.
   */
  const [about, setAbout] =
    useState("");

  /*
   * Current buyer location is separate from
   * Preferred Regions.
   *
   * We are not connecting this to the
   * preferences endpoint.
   */
  const [location, setLocation] =
    useState("");

  /*
   * ------------------------------------------------
   * Profile image
   * ------------------------------------------------
   */
  const [profileImage, setProfileImage] =
    useState<string | undefined>(undefined);

  const [isImageModalOpen, setIsImageModalOpen] =
    useState(false);

  /*
   * ------------------------------------------------
   * TEMPORARY ACCESS TOKEN
   * ------------------------------------------------
   *
   * DO NOT put a fake token here.
   *
   * Replace this with the actual Supabase session
   * access token once the frontend auth/session
   * implementation is connected.
   */

  /*
   * ------------------------------------------------
   * Load buyer preferences
   * ------------------------------------------------
   */

  /*
   * Once an access token exists, fetch preferences.
   */
  useEffect(() => {
    
    let cancelled = false;

    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getBuyerPreferences();

        if (!cancelled) {
          setPreferences(data);

          /*
           * Keep existing backend preferences.
           */
          setAbout("");

          /*
           * If the backend profile location
           * is connected later, set it here.
           */
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load buyer preferences.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ------------------------------------------------
   * Profile Image
   * ------------------------------------------------
   */
  const handleProfileImageDone = (imageSrc: string) => {
    setProfileImage(imageSrc);
    setIsImageModalOpen(false);
  };

  /*
   * ------------------------------------------------
   * Overview
   * ------------------------------------------------
   */
  const handleOverviewContinue = (data: {
    about: string;
    regions: NonNullable<
      BuyerPreferences["target_locations"]
    >;
    industries: string[];
  }) => {
    setAbout(data.about);

    setPreferences((current) => ({
      ...(current ?? {}),
      target_locations: data.regions,
      target_industries: data.industries,
    }));

    setActiveTab("industry-experience");
  };

  /*
   * ------------------------------------------------
   * Industry Experience
   * ------------------------------------------------
   *
   * This is currently separate from the
   * BuyerPreferences API contract.
   *
   * Keep collecting it in the UI.
   */
  const handleIndustryExperienceContinue = (data: {
      buyerType: string;
      workSituation: string;
      years: string;
      industries: string[];
      roles: string[];
    }) => {
      console.log("Industry experience:", data);

      setActiveTab("acquisition-preferences");
    };

  /*
   * ------------------------------------------------
   * Acquisition Preferences
   * ------------------------------------------------
   */
  const handleAcquisitionPreferencesContinue =
    (data: {
      acquisitionPreferences: string;
      motivation: string;
      involvement:
        | "operator"
        | "investor"
        | "owner-management"
        | "partner";
      timeline:
        | "exploring"
        | "within-1-12"
        | "within-12-24"
        | "within-24-plus";
    }) => {
      /*
       * These fields are from the current UI,
       * but some do not exist in the backend
       * preferences schema.
       *
       * Do NOT blindly send them to the API.
       */
      console.log(
        "Acquisition preferences:",
        data,
      );
    };

  /*
   * ------------------------------------------------
   * Final Save
   * ------------------------------------------------
   */
  const handleSave = async () => {
    
    setSaving(true);
    setError(null);

    try {
      /*
       * IMPORTANT:
       *
       * Send only fields accepted by
       * BuyerPreferencesUpsert.
       *
       * Do not send:
       * id
       * buyer_id
       * created_at
       * updated_at
       */
      const payload: BuyerPreferencesPayload = {
        target_industries:
          preferences?.target_industries ??
          null,

        target_locations:
          preferences?.target_locations ??
          null,

        maximum_purchase_price:
          preferences?.maximum_purchase_price ??
          null,

        minimum_required_sde:
          preferences?.minimum_required_sde ??
          null,

        preferred_sde:
          preferences?.preferred_sde ??
          null,

        minimum_required_arr:
          preferences?.minimum_required_arr ??
          null,

        preferred_arr:
          preferences?.preferred_arr ??
          null,

        preferred_owner_hours_per_week:
          preferences?.preferred_owner_hours_per_week ??
          null,

        required_transition_training_days:
          preferences?.required_transition_training_days ??
          null,

        deal_preference:
          preferences?.deal_preference ??
          null,

        real_estate_preference:
          preferences?.real_estate_preference ??
          null,

        minimum_years_in_operation:
          preferences?.minimum_years_in_operation ??
          null,

        accepts_customer_concentration_above_25_percent:
          preferences?.accepts_customer_concentration_above_25_percent ??
          null,

        preferred_acquisition_timeline:
          preferences?.preferred_acquisition_timeline ??
          null,
      };

      const saved =
        await saveBuyerPreferences(payload);

      setPreferences(saved);

      /*
       * Save successful.
       */
      console.log(
        "Buyer preferences saved successfully.",
        saved,
      );

      /*
       * Optional:
       * return to preview after saving.
       */
      router.push("/buyer/profile");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save buyer preferences.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * Cancel
   * ------------------------------------------------
   */
  const handleCancel = () => {
    router.push("/buyer/profile");
  };

  /*
   * ------------------------------------------------
   * Loading
   * ------------------------------------------------
   */
  if (loading) {
    return (
      <main className="buyer-profile-edit">
        <div className="buyer-profile-edit__content">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------------
   * Render
   * ------------------------------------------------
   */
  return (
    <main className="buyer-profile-edit">
      <div className="buyer-profile-edit__content">

        {/* Error */}
        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#b42318",
            }}
          >
            {error}
          </div>
        )}

        {/* Header */}

        <ProfileEditHeader
          name="Original Name"
          location={location}
          imageSrc={profileImage}
          onLocationChange={setLocation}
          mode="edit"
          onImageChange={() =>
            setIsImageModalOpen(true)
          }
          onPreview={() => {
            router.push(
              "/buyer/profile",
            );
          }}
          onModeChange={(mode) => {
            if (
              mode === "preview"
            ) {
              router.push(
                "/buyer/profile",
              );
            }
          }}
        />

        {/* Tabs */}

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Overview */}

        {activeTab === "overview" && (
          <EditOverviewSection
            key={preferences?.updated_at ?? "new"}
            initialAbout={about}
            initialRegions={
              preferences?.target_locations ?? []
            }
            initialIndustries={
              preferences?.target_industries ?? []
            }
            onContinue={handleOverviewContinue}
            disabled={saving}
          />
        )}

        {/* Industry Experience */}

        {activeTab ===
          "industry-experience" && (
          <IndustryExperienceSection
            initialBuyerType="first-time-buyer"
            initialWorkSituation="employed-full-time"
            initialIndustries={[]}
            initialYears=""
            initialRoles={[]}
            onBack={() =>
              setActiveTab(
                "overview",
              )
            }
            onContinue={
              handleIndustryExperienceContinue
            }
          />
        )}

        {/* Acquisition Preferences */}

        {activeTab ===
          "acquisition-preferences" && (
          <AcquisitionPreferencesSection
            initialAcquisitionPreferences=""
            initialMotivation=""
            initialInvolvement="operator"
            initialTimeline="exploring"
            onBack={() =>
              setActiveTab(
                "industry-experience",
              )
            }
            onContinue={
              handleAcquisitionPreferencesContinue
            }
          />
        )}

        {/* Save / Cancel */}

        <ProfileFormActions
          onCancel={
            handleCancel
          }
          onSave={
            handleSave
          }
          saving={saving}
        />

        <ProfileImageModal
          isOpen={isImageModalOpen}
          imageSrc={profileImage}
          onClose={() =>
            setIsImageModalOpen(false)
          }
          onDone={handleProfileImageDone}
        />

      </div>
    </main>
  );
}