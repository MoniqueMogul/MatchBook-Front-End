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

import {
  getBuyerProfile,
  type BuyerProfile,
} from "@/lib/api/buyer";

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

  const [profile, setProfile] =
    useState<BuyerProfile | null>(null);

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
   * Once an access token exists, fetch preferences.
   */
  useEffect(() => {
    let cancelled = false;

    const loadPreferences = async () => {
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
              : "Failed to load buyer profile and preferences.",
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
    regions: NonNullable<
      BuyerPreferences["target_locations"]
    >;
    industries: string[];
  }) => {
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
  const handleAcquisitionPreferencesContinue = (data: {
    industries: string[];
    minimumYearsInOperation?: number;
    minimumARR?: number;
    minimumSDE?: number;
    maximumPurchasePrice?: number;
    preferredARR?: number;
    preferredSDE?: number;
    preferredOwnerHoursPerWeek?: number;
    customerConcentration?: boolean;
    sellerTrainingDays?: number;
    dealPreference?: "cash" | "financing" | "either";
    realEstatePreference?: "included" | "lease" | "either";
    timeline?: "exploring" | "within-1-12" | "within-12-24" | "within-24-plus";
  }) => {
    setPreferences((current) => ({
      ...(current ?? {}),

      target_industries: data.industries,

      minimum_years_in_operation:
        data.minimumYearsInOperation ?? null,

      minimum_required_arr:
        data.minimumARR ?? null,

      minimum_required_sde:
        data.minimumSDE ?? null,

      maximum_purchase_price:
        data.maximumPurchasePrice ?? null,

      preferred_arr:
        data.preferredARR ?? null,

      preferred_sde:
        data.preferredSDE ?? null,

      preferred_owner_hours_per_week:
        data.preferredOwnerHoursPerWeek ?? null,

      accepts_customer_concentration_above_25_percent:
        data.customerConcentration ?? null,

      required_transition_training_days:
        data.sellerTrainingDays ?? null,

      deal_preference:
        data.dealPreference ?? null,
      
      real_estate_preference:
        data.realEstatePreference ?? null,

      preferred_acquisition_timeline:
        data.timeline ?? null,
    }));

    setActiveTab("overview");
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
          onImageChange={() =>
            setIsImageModalOpen(true)
          }
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
            initialIndustries={
              preferences?.target_industries ?? []
            }

            initialMinimumYearsInOperation={
              preferences?.minimum_years_in_operation ?? null
            }

            initialMinimumARR={
              preferences?.minimum_required_arr ?? null
            }

            initialMinimumSDE={
              preferences?.minimum_required_sde ?? null
            }

            initialMaximumPurchasePrice={
              preferences?.maximum_purchase_price ?? null
            }

            initialPreferredARR={
              preferences?.preferred_arr ?? null
            }

            initialPreferredSDE={
              preferences?.preferred_sde ?? null
            }

            initialPreferredOwnerHoursPerWeek={
              preferences?.preferred_owner_hours_per_week ?? null
            }

            initialCustomerConcentration={
              preferences?.accepts_customer_concentration_above_25_percent ?? null
            }

            initialSellerTrainingDays={
              preferences?.required_transition_training_days ?? null
            }

            initialDealPreference={
              preferences?.deal_preference ?? null
            }

            initialRealEstatePreference={
              preferences?.real_estate_preference ?? null
            }

            initialTimeline={
              preferences?.preferred_acquisition_timeline as
                | "exploring"
                | "within-1-12"
                | "within-12-24"
                | "within-24-plus"
                | undefined
            }

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