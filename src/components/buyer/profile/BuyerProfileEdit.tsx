"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ExperienceCredentialsEdit, {
  type ExperienceCredentialsData,
} from "./ExperienceCredentialsEdit";
import AcquisitionPreferencesSection from "./AcquisitionPreferencesSection";
import FinanceEdit from "./FinanceEdit";
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
  updateBuyerProfile,
  type BuyerProfile,
  type BuyerProfileUpdatePayload,
} from "@/lib/api/buyer";

import "./BuyerProfileEdit.css";

export default function BuyerProfileEdit() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("overview");

  const [preferences, setPreferences] =
    useState<BuyerPreferences | null>(null);

  const [profile, setProfile] =
    useState<BuyerProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [location, setLocation] =
    useState("");

  const [profileImage, setProfileImage] =
    useState<string | undefined>(undefined);

  const [isImageModalOpen, setIsImageModalOpen] =
    useState(false);

  /*
   * ------------------------------------------------
   * Initial GET
   * ------------------------------------------------
   */

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

          const currentLocation = [
            profileData.city,
            profileData.state,
          ]
            .filter(Boolean)
            .join(", ");

          setLocation(currentLocation);
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
   *
   * Preferred Regions are now handled in
   * Acquisition Preferences.
   */

  const handleOverviewContinue = async (data: {
    about: string;
  }) => {
    try {
      setSaving(true);
      setError(null);

      const updatedProfile = await updateBuyerProfile({
        about_me: data.about,
      });

      setProfile(updatedProfile);
      setActiveTab("industry-experience");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save About information.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * Experience & Credentials
   * ------------------------------------------------
   */

  const handleExperienceCredentialsContinue = (
    data: ExperienceCredentialsData,
  ) => {
    setProfile((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,

        buyer_type:
          data.buyerType ?? current.buyer_type,

        current_industry:
          data.currentIndustry || null,

        current_position:
          data.currentPosition || null,

        business_experience_years:
          data.businessExperienceYears === ""
            ? null
            : Number(data.businessExperienceYears),

        relevant_experience:
          data.relevantExperience || null,

        available_hours_per_week:
          data.availableHoursPerWeek === ""
            ? null
            : Number(data.availableHoursPerWeek),

        city:
          data.city || null,

        county:
          data.county || null,

        state:
          data.state || null,

        zip_code:
          data.zipCode || null,
      };
    });

    setActiveTab("acquisition-preferences");
  };

  /*
   * ------------------------------------------------
   * Acquisition Preferences
   * ------------------------------------------------
   */

  const handleAcquisitionPreferencesContinue = (data: {
    industries: string[];

    targetLocations: NonNullable<
      BuyerPreferences["target_locations"]
    >;

    minimumYearsInOperation?: number;
    minimumARR?: number;
    minimumSDE?: number;

    maximumPurchasePrice?: number;
    preferredARR?: number;
    preferredSDE?: number;
    preferredOwnerHoursPerWeek?: number;

    customerConcentration?: boolean;
    sellerTrainingDays?: number;

    dealPreference?:
      | "cash"
      | "financing"
      | "either";

    realEstatePreference?:
      | "included"
      | "lease"
      | "either";

    timeline?:
      | "exploring"
      | "within-1-12"
      | "within-12-24"
      | "within-24-plus";
  }) => {
    setPreferences((current) => ({
      ...(current ?? {}),

      target_industries:
        data.industries,

      /*
       * Preferred Regions now belongs to
       * Acquisition Preferences.
       */
      target_locations:
        data.targetLocations,

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

    setActiveTab("finances");
  };

  /*
   * ------------------------------------------------
   * Build Buyer Profile PATCH payload
   * ------------------------------------------------
   */

  const buildBuyerProfilePayload =
    (): BuyerProfileUpdatePayload | null => {
      if (!profile) {
        return null;
      }

      return {
        buyer_type: profile.buyer_type,

        current_industry:
          profile.current_industry ?? null,

        current_position:
          profile.current_position ?? null,

        business_experience_years:
          profile.business_experience_years ?? null,

        relevant_experience:
          profile.relevant_experience ?? null,

        available_hours_per_week:
          profile.available_hours_per_week ?? null,

        city:
          profile.city ?? null,

        county:
          profile.county ?? null,

        state:
          profile.state ?? null,

        zip_code:
          profile.zip_code ?? null,
      };
    };

  /*
   * ------------------------------------------------
   * Build Buyer Preferences PUT payload
   * ------------------------------------------------
   */

  const buildBuyerPreferencesPayload =
    (): BuyerPreferencesPayload => ({
      target_industries:
        preferences?.target_industries ?? null,

      target_locations:
        preferences?.target_locations ?? null,

      maximum_purchase_price:
        preferences?.maximum_purchase_price ?? null,

      minimum_required_sde:
        preferences?.minimum_required_sde ?? null,

      preferred_sde:
        preferences?.preferred_sde ?? null,

      minimum_required_arr:
        preferences?.minimum_required_arr ?? null,

      preferred_arr:
        preferences?.preferred_arr ?? null,

      preferred_owner_hours_per_week:
        preferences?.preferred_owner_hours_per_week ?? null,

      required_transition_training_days:
        preferences?.required_transition_training_days ??
        null,

      deal_preference:
        preferences?.deal_preference ?? null,

      real_estate_preference:
        preferences?.real_estate_preference ?? null,

      minimum_years_in_operation:
        preferences?.minimum_years_in_operation ?? null,

      accepts_customer_concentration_above_25_percent:
        preferences
          ?.accepts_customer_concentration_above_25_percent ??
        null,

      preferred_acquisition_timeline:
        preferences?.preferred_acquisition_timeline ??
        null,
    });

  /*
   * ------------------------------------------------
   * FINAL SAVE
   * ------------------------------------------------
   *
   * Buyer Profile  -> PATCH
   * Buyer Preferences -> PUT
   *
   * Both are saved before redirecting to preview.
   */

  const handleSave = async () => {
    if (!profile) {
      setError("Buyer profile is not loaded.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const buyerProfilePayload =
        buildBuyerProfilePayload();

      const buyerPreferencesPayload =
        buildBuyerPreferencesPayload();

      if (!buyerProfilePayload) {
        throw new Error(
          "Buyer profile data is unavailable.",
        );
      }

      const [
        savedProfile,
        savedPreferences,
      ] = await Promise.all([
        updateBuyerProfile(
          buyerProfilePayload,
        ),
        saveBuyerPreferences(
          buyerPreferencesPayload,
        ),
      ]);

      setProfile(savedProfile);
      setPreferences(savedPreferences);

      console.log(
        "Buyer profile and preferences saved successfully.",
        {
          profile: savedProfile,
          preferences: savedPreferences,
        },
      );

      router.push("/buyer/profile");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save buyer profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * CANCEL
   * ------------------------------------------------
   *
   * No API request.
   * Preview will GET backend values again.
   */

  const handleCancel = () => {
    const previewTabMap: Record<
      ProfileTab,
      string
    > = {
      overview: "overview",
      "industry-experience":
        "industry-experience",
      "acquisition-preferences":
        "acquisition-preferences",
      finances: "finances",
    };

    router.push(
      `/buyer/profile?tab=${previewTabMap[activeTab]}`,
    );
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
            initialAbout={profile?.about_me ?? ""}
            onContinue={handleOverviewContinue}
            disabled={saving}
          />
        )}

        {/* Experience & Credentials */}

        {activeTab ===
          "industry-experience" && (
          <ExperienceCredentialsEdit
            initialData={{
              buyerType:
                profile?.buyer_type ?? null,

              currentIndustry:
                profile?.current_industry ?? "",

              currentPosition:
                profile?.current_position ?? "",

              businessExperienceYears:
                profile?.business_experience_years !=
                null
                  ? String(
                      profile.business_experience_years,
                    )
                  : "",

              relevantExperience:
                profile?.relevant_experience ?? "",

              availableHoursPerWeek:
                profile?.available_hours_per_week !=
                null
                  ? String(
                      profile.available_hours_per_week,
                    )
                  : "",

              city:
                profile?.city ?? "",

              county:
                profile?.county ?? "",

              state:
                profile?.state ?? "",

              zipCode:
                profile?.zip_code ?? "",
            }}
            onBack={() =>
              setActiveTab("overview")
            }
            onContinue={
              handleExperienceCredentialsContinue
            }
            disabled={saving}
          />
        )}

        {/* Acquisition Preferences */}

        {activeTab ===
          "acquisition-preferences" && (
          <AcquisitionPreferencesSection
            initialIndustries={
              preferences?.target_industries ?? []
            }

            initialTargetLocations={
              preferences?.target_locations ?? []
            }

            initialMinimumYearsInOperation={
              preferences?.minimum_years_in_operation ??
              null
            }

            initialMinimumARR={
              preferences?.minimum_required_arr ??
              null
            }

            initialMinimumSDE={
              preferences?.minimum_required_sde ??
              null
            }

            initialMaximumPurchasePrice={
              preferences?.maximum_purchase_price ??
              null
            }

            initialPreferredARR={
              preferences?.preferred_arr ??
              null
            }

            initialPreferredSDE={
              preferences?.preferred_sde ??
              null
            }

            initialPreferredOwnerHoursPerWeek={
              preferences
                ?.preferred_owner_hours_per_week ??
              null
            }

            initialCustomerConcentration={
              preferences
                ?.accepts_customer_concentration_above_25_percent ??
              null
            }

            initialSellerTrainingDays={
              preferences
                ?.required_transition_training_days ??
              null
            }

            initialDealPreference={
              preferences?.deal_preference ??
              null
            }

            initialRealEstatePreference={
              preferences
                ?.real_estate_preference ??
              null
            }

            initialTimeline={
              preferences
                ?.preferred_acquisition_timeline as
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

            disabled={saving}
          />
        )}

        {/* Finance */}

        {activeTab === "finances" && (
          <FinanceEdit
             purchasePrice={
            preferences?.maximum_purchase_price != null
              ? String(preferences.maximum_purchase_price)
              : ""
          }
          onPurchasePriceChange={(value) => {
            setPreferences((previous) =>
              previous
                ? {
                    ...previous,
                    maximum_purchase_price:
                      value.trim() === ""
                        ? null
                        : Number(value),
                  }
                : previous,
            );
          }}
          onBack={() =>
            setActiveTab("acquisition-preferences")
          }
          disabled={saving}
          />
        )}

        {/* Global Save / Cancel */}

        <ProfileFormActions
          onCancel={handleCancel}
          onSave={handleSave}
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