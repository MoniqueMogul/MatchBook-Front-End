"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import IndustryExperienceSection from "./IndustryExperienceSection";
import AcquisitionPreferencesSection from "./AcquisitionPreferencesSection";
import ProfileEditHeader from "./ProfileEditHeader";
import ProfileImageModal from "./ProfileImageModal";
import ProfileTabs, { type ProfileTab } from "./ProfileTabs";
import EditOverviewSection from "./EditOverviewSection";
import ProfileFormActions from "./ProfileFormActions";

import {
  getBuyerPreferences,
  updateBuyerPreferences,
} from "@/lib/api/buyerPreferences";
import { uiToApi, apiToUi } from "@/lib/api/buyerPreferences.mappers";
import type { UiAcquisitionPreferences } from "@/lib/api/buyerPreferences.types";

import "./BuyerProfileEdit.css";

export default function BuyerProfileEdit() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("overview");

  const [location, setLocation] =
    useState("Original Location");

  const [profileImage, setProfileImage] =
    useState<string | undefined>(undefined);

  const [isImageModalOpen, setIsImageModalOpen] =
    useState(false);

  const [saving, setSaving] = useState(false);

  /* =========================
     Buyer preferences state
     (populated from GET on mount,
      mutated as sections emit changes)
     ========================= */

  const [preferences, setPreferences] =
    useState<Partial<UiAcquisitionPreferences>>({});

  /* =========================
     Load preferences on mount
     ========================= */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getBuyerPreferences();
        if (!cancelled) {
          setPreferences(apiToUi(data));
        }
      } catch (err) {
        // Silent fail — user may be new and have no preferences yet.
        // Backend may 404 on first visit; that's fine.
        console.warn("Could not load buyer preferences:", err);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================
     Save Profile
     ========================= */

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = uiToApi(preferences);
      const saved = await updateBuyerPreferences(payload);
      setPreferences(apiToUi(saved));
      console.log("Preferences saved:", saved);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Cancel Edit
     ========================= */

  const handleCancel = () => {
    console.log("Profile edit cancelled");
  };

  /* =========================
     Profile Image
     ========================= */

  const handleProfileImageDone = (imageSrc: string) => {
    setProfileImage(imageSrc);
    setIsImageModalOpen(false);
  };

  /* =========================
     Overview → Industry Experience
     ========================= */

  const handleOverviewContinue = (data: {
    about: string;
    regions: string[];
    industries: string[];
  }) => {
    console.log("Continue with overview data:", data);
    setActiveTab("industry-experience");
  };

  /* =========================
     Industry Experience → Acquisition Preferences
     ========================= */

  const handleIndustryExperienceContinue = (data: {
    buyerType: string;
    workSituation: string;
    years: string;
    industries: string[];
    roles: string[];
  }) => {
    console.log("Industry experience:", data);

    // The buyer profile API doesn't currently have a place for
    // buyerType/workSituation/years/industries/roles on the
    // preferences endpoint. So we keep them in local UI state
    // for now and Sri will handle the profile PATCH separately.
    setActiveTab("acquisition-preferences");
  };

  /* =========================
     Acquisition Preferences
     ========================= */

  const handleAcquisitionPreferencesContinue = (data: {
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
    industries?: string[];
    companySizes?: string[];
    minimumYearsInOperation?: string;
    minimumARR?: string;
    minimumSDE?: string;
    customerConcentration?: string;
    sellerTraining?: string;
    zipcode?: string;
    searchRadius?: number;
  }) => {
    console.log("Acquisition preferences:", data);

    // Merge emitted values into local preferences state.
    // Only the 5 mapped fields will actually hit the backend
    // via uiToApi() when Save is clicked.
    setPreferences((prev) => ({
      ...prev,
      acquisitionPreferences: data.acquisitionPreferences,
      motivation: data.motivation,
      involvement: data.involvement,
      timeline: data.timeline,
      industries: data.industries ?? prev.industries ?? [],
      companySizes: data.companySizes ?? prev.companySizes ?? [],
      minimumYearsInOperation:
        data.minimumYearsInOperation ?? prev.minimumYearsInOperation ?? "",
      minimumARR: data.minimumARR ?? prev.minimumARR ?? "",
      minimumSDE: data.minimumSDE ?? prev.minimumSDE ?? "",
      customerConcentration:
        data.customerConcentration ?? prev.customerConcentration ?? "",
      sellerTraining: data.sellerTraining ?? prev.sellerTraining ?? "",
      zipcode: data.zipcode ?? prev.zipcode ?? "",
      searchRadius: data.searchRadius ?? prev.searchRadius ?? 20,
    }));
  };

  /* =========================
     Render
     ========================= */

  return (
    <main className="buyer-profile-edit">
      <div className="buyer-profile-edit__content">

        <ProfileEditHeader
          name="Original Name"
          location={location}
          imageSrc={profileImage}
          onLocationChange={setLocation}
          mode="edit"
          onImageChange={() => setIsImageModalOpen(true)}
          onPreview={() => {
            router.push("/buyer/profile");
          }}
          onModeChange={(mode) => {
            if (mode === "preview") {
              router.push("/buyer/profile");
            }
          }}
        />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "overview" && (
          <EditOverviewSection
            initialAbout="Placeholder text for a longer response,spanning multiple lines."
            initialRegions={["Location 1", "Location 2", "Location 3"]}
            initialIndustries={[]}
            onContinue={handleOverviewContinue}
          />
        )}

        {activeTab === "industry-experience" && (
          <IndustryExperienceSection
            initialBuyerType="first-time-buyer"
            initialWorkSituation="employed-full-time"
            initialIndustries={[]}
            initialYears=""
            initialRoles={[]}
            onBack={() => setActiveTab("overview")}
            onContinue={handleIndustryExperienceContinue}
          />
        )}

        {activeTab === "acquisition-preferences" && (
          <AcquisitionPreferencesSection
            initialAcquisitionPreferences={
              preferences.acquisitionPreferences ?? ""
            }
            initialMotivation={preferences.motivation ?? ""}
            initialInvolvement={
              (preferences.involvement as
                | "operator"
                | "investor"
                | "owner-management"
                | "partner") ?? "operator"
            }
            initialTimeline={
              (preferences.timeline as
                | "exploring"
                | "within-1-12"
                | "within-12-24"
                | "within-24-plus") ?? "exploring"
            }
            initialIndustries={preferences.industries ?? []}
            initialCompanySizes={preferences.companySizes ?? []}
            initialMinimumYearsInOperation={
              preferences.minimumYearsInOperation ?? ""
            }
            initialMinimumARR={preferences.minimumARR ?? ""}
            initialMinimumSDE={preferences.minimumSDE ?? ""}
            initialCustomerConcentration={
              preferences.customerConcentration ?? ""
            }
            initialSellerTraining={preferences.sellerTraining ?? ""}
            initialZipcode={preferences.zipcode ?? ""}
            initialSearchRadius={preferences.searchRadius ?? 20}
            onBack={() => setActiveTab("industry-experience")}
            onContinue={handleAcquisitionPreferencesContinue}
          />
        )}

        <ProfileFormActions
          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
        />

        <ProfileImageModal
          isOpen={isImageModalOpen}
          imageSrc={profileImage}
          onClose={() => setIsImageModalOpen(false)}
          onDone={handleProfileImageDone}
        />
      </div>
    </main>
  );
}