"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useBuyerOnboardingStore } from "@/store/useBuyerOnboardingStore";

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
  type ApiTargetLocation,
  type TargetIndustryPreference,
  type DealPreference,
  type RealEstatePreference,
} from "@/lib/api/buyerPreferences";

import {
  getBuyerProfile,
  createBuyerProfile,
  updateBuyerProfile,
  type BuyerProfile,
  type BuyerProfileUpdatePayload,
} from "@/lib/api/buyer";

import "./BuyerProfileEdit.css";

interface BuyerProfileEditProps {
  mode?: "edit" | "onboarding";
}

export default function BuyerProfileEdit({
  mode = "edit",
}: BuyerProfileEditProps) {
  const router = useRouter();
  const isOnboarding = mode === "onboarding";

  const markSectionCompleted =
    useBuyerOnboardingStore(
      (state) => state.markSectionCompleted
    );

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("overview");

  const [preferences, setPreferences] =
    useState<BuyerPreferences | null>(
      isOnboarding ? ({} as BuyerPreferences) : null,
    );

  const [profile, setProfile] =
    useState<BuyerProfile | null>(
      isOnboarding ? ({} as BuyerProfile) : null,
    );

  const [loading, setLoading] =
    useState(!isOnboarding);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [location, setLocation] =
    useState("");
  const [userName, setUserName] = 
    useState("");
  const [profileImage, setProfileImage] =
    useState<string | undefined>(undefined);

  const [isImageModalOpen, setIsImageModalOpen] =
    useState(false);

  /*
   * ------------------------------------------------
   * Initial GET
   * ------------------------------------------------
   *
   * Normal edit mode:
   *   GET buyer profile
   *   GET buyer preferences
   *
   * Onboarding mode:
   *   No backend GET yet.
   *   Overview creates the buyer profile with POST.
   *   Experience & Credentials updates it with PATCH.
   */

  useEffect(() => {
    // During onboarding, the buyer profile does not exist yet.
    // Do NOT call GET /intake/buyers/profile.
    if (isOnboarding) {
      setLoading(false);
      return;
    }

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
  }, [isOnboarding]);

  useEffect(() => {
    const loadUserName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const firstName = user.user_metadata?.first_name;
      const lastName = user.user_metadata?.last_name;

      const fullName =
        [firstName, lastName]
          .filter(Boolean)
          .join(" ") ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "";

      setUserName(fullName);
    };

    loadUserName();
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
   * Onboarding:
   *   POST /intake/buyers/profile with about_me.
   *
   * Edit:
   *   PATCH /intake/buyers/profile immediately.
   */

  const handleOverviewContinue = async (data: {
    about: string;
  }) => {
    if (isOnboarding && !data.about.trim()) {
      setError(
        "Please tell sellers a little about yourself.",
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const nextProfile = {
        ...(profile ?? ({} as BuyerProfile)),
        about_me: data.about.trim(),
      };

      if (isOnboarding) {
        const createdProfile = await createBuyerProfile({
          about_me: data.about.trim(),
        });

        setProfile(createdProfile);
        markSectionCompleted("overview");
        setActiveTab("industry-experience");
        return;
      }

      // Normal edit mode: profile already exists.
      const savedProfile = await updateBuyerProfile({
        buyer_type:
          nextProfile.buyer_type ?? null,

        current_industry:
          nextProfile.current_industry ?? null,

        current_position:
          nextProfile.current_position ?? null,

        business_experience_years:
          nextProfile.business_experience_years ?? null,

        relevant_experience:
          nextProfile.relevant_experience ?? null,

        available_hours_per_week:
          nextProfile.available_hours_per_week ?? null,

        city:
          nextProfile.city ?? null,

        county:
          nextProfile.county ?? null,

        state:
          nextProfile.state ?? null,

        zip_code:
          nextProfile.zip_code ?? null,

        about_me:
          nextProfile.about_me,
      });

      setProfile(savedProfile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save your overview.",
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

  const handleExperienceCredentialsContinue = async (
    data: ExperienceCredentialsData,
  ) => {
    const buyerType = data.buyerType;

    if (!buyerType) {
      setError("Please select a buyer type.");
      return;
    }

    const profileData: BuyerProfileUpdatePayload = {
      buyer_type: buyerType,

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

      about_me:
        profile?.about_me ?? null,
    };

    try {
      setSaving(true);
      setError(null);

      // Overview already created the buyer profile during onboarding.
      // Experience & Credentials now updates that existing profile.
      const updatedProfile =
        await updateBuyerProfile(profileData);

      setProfile(updatedProfile);

      if (isOnboarding) {
        markSectionCompleted("experience");
      }

      setActiveTab("acquisition-preferences");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save Experience & Credentials.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * Acquisition Preferences
   * ------------------------------------------------
   */

  const handleAcquisitionPreferencesContinue = async (data: {
    targetIndustryPreferences: TargetIndustryPreference[];
    targetBusinessModels: string[];
    targetBusinessTypes: string[];
    targetLocations: ApiTargetLocation[];

    minimumYearsInOperation?: number;
    minimumARR?: number;
    minimumSDE?: number;
    maximumPurchasePrice?: number;
    preferredARR?: number;
    preferredSDE?: number;
    preferredOwnerHoursPerWeek?: number;
    customerConcentration?: boolean;
    sellerTrainingDays?: number;
    dealPreference?: DealPreference;
    realEstatePreference?: RealEstatePreference;
    timeline?:
      | "exploring"
      | "within-1-12"
      | "within-12-24"
      | "within-24-plus";
  }) => {
    setSaving(true);
    setError(null);

    try {
      const nextPreferences: BuyerPreferences = {
        ...(preferences ?? ({} as BuyerPreferences)),

        target_industry_preferences:
          data.targetIndustryPreferences,
        target_business_models:
          data.targetBusinessModels,
        target_business_types:
          data.targetBusinessTypes,
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
      };

      setPreferences(nextPreferences);

      const savedPreferences =
        await saveBuyerPreferences({
          target_industry_preferences:
            nextPreferences.target_industry_preferences ?? null,
          target_business_models:
            nextPreferences.target_business_models ?? null,
          target_business_types:
            nextPreferences.target_business_types ?? null,
          target_locations:
            nextPreferences.target_locations ?? null,
          maximum_purchase_price:
            nextPreferences.maximum_purchase_price ?? null,
          minimum_required_sde:
            nextPreferences.minimum_required_sde ?? null,
          preferred_sde:
            nextPreferences.preferred_sde ?? null,
          minimum_required_arr:
            nextPreferences.minimum_required_arr ?? null,
          preferred_arr:
            nextPreferences.preferred_arr ?? null,
          preferred_owner_hours_per_week:
            nextPreferences.preferred_owner_hours_per_week ?? null,
          required_transition_training_days:
            nextPreferences.required_transition_training_days ?? null,
          deal_preference:
            nextPreferences.deal_preference ?? null,
          real_estate_preference:
            nextPreferences.real_estate_preference ?? null,
          minimum_years_in_operation:
            nextPreferences.minimum_years_in_operation ?? null,
          accepts_customer_concentration_above_25_percent:
            nextPreferences
              .accepts_customer_concentration_above_25_percent ??
            null,
          preferred_acquisition_timeline:
            nextPreferences.preferred_acquisition_timeline ?? null,
        });

      setPreferences(savedPreferences);
      markSectionCompleted("acquisition");
      setActiveTab("finances");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save acquisition preferences.",
      );
    } finally {
      setSaving(false);
    }
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
        buyer_type:
          profile.buyer_type,

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
      target_industry_preferences:
        preferences?.target_industry_preferences ?? null,

      target_business_models:
        preferences?.target_business_models ?? null,

      target_business_types:
        preferences?.target_business_types ?? null,

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
   * ONBOARDING:
   *   Profile is created during Overview.
   *   Experience updates the profile with PATCH.
   *   Acquisition Preferences and Finance are persisted
   *   through the preferences PUT request.
   *
   * EDIT:
   *   Existing backend PATCH + PUT behavior.
   */

  const handleSave = async () => {
    /*
     * ----------------------------------------------
     * ONBOARDING MODE
     * ----------------------------------------------
     *
     * Acquisition Preferences are already persisted with PUT.
     * Finance updates the local preferences state, and the
     * final Save persists the complete preferences payload.
     */
    if (isOnboarding && activeTab !== "finances") {
      return;
    }

    if (isOnboarding) {
      setSaving(true);
      setError(null);

      try {
        if (!preferences) {
          throw new Error(
            "Buyer preferences are unavailable.",
          );
        }

        const savedPreferences =
          await saveBuyerPreferences(
            buildBuyerPreferencesPayload(),
          );

        setPreferences(savedPreferences);
        markSectionCompleted("finances");
        router.push("/buyer-dashboard");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save buyer preferences.",
        );
      } finally {
        setSaving(false);
      }

      return;
    }

    /*
     * ----------------------------------------------
     * NORMAL EDIT MODE
     * ----------------------------------------------
     */

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
   */

  const handleCancel = () => {
    /*
     * During onboarding there is no existing
     * profile preview to return to.
     */
    if (isOnboarding) {
      router.push("/buyer-dashboard");
      return;
    }

    /*
     * Existing edit-mode behavior.
     */
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
          name={userName}
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
          onboarding={isOnboarding}
        />

        {/* Overview */}

        {activeTab === "overview" && (
          <EditOverviewSection
            isOnboarding={isOnboarding}
            initialAbout={
              profile?.about_me ?? ""
            }
            onContinue={
              handleOverviewContinue
            }
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
            initialTargetIndustryPreferences={
              preferences?.target_industry_preferences ?? []
            }

            initialTargetBusinessModels={
              preferences?.target_business_models ?? []
            }

            initialTargetBusinessTypes={
              preferences?.target_business_types ?? []
            }

            initialTargetLocations={
              preferences?.target_locations ?? []
            }

            initialMinimumYearsInOperation={
              preferences
                ?.minimum_years_in_operation ??
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
              preferences
                ?.maximum_purchase_price != null
                ? String(
                    preferences.maximum_purchase_price,
                  )
                : ""
            }

            onPurchasePriceChange={(value) => {
              setPreferences((previous) => ({
                ...(previous ??
                  ({} as BuyerPreferences)),

                maximum_purchase_price:
                  value.trim() === ""
                    ? null
                    : Number(value),
              }));
            }}

            onBack={() =>
              setActiveTab(
                "acquisition-preferences",
              )
            }

            disabled={saving}
          />
        )}

        {/* Global Save / Cancel */}

        {(!isOnboarding || activeTab === "finances") && (
          <ProfileFormActions
            onCancel={handleCancel}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {/* Profile Image Modal */}

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