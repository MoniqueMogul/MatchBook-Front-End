"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import IndustryExperienceSection from "./IndustryExperienceSection";
import AcquisitionPreferencesSection from "./AcquisitionPreferencesSection";
import ProfileEditHeader from "./ProfileEditHeader";
import ProfileImageModal from "./ProfileImageModal";
import ProfileTabs, { type ProfileTab } from "./ProfileTabs";
import EditOverviewSection from "./EditOverviewSection";
import ProfileFormActions from "./ProfileFormActions";

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
     Save Profile
     ========================= */

  const handleSave = async () => {
    setSaving(true);

    try {
      /*
       * Backend/API integration will be connected
       * once the final API contract is available.
       */
      console.log("Profile save requested");
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
     Overview
     ↓
     Industry Experience
     ========================= */

  const handleOverviewContinue = (data: {
    about: string;
    regions: string[];
    industries: string[];
  }) => {
    console.log(
      "Continue with overview data:",
      data
    );

    setActiveTab("industry-experience");
  };

  /* =========================
     Industry Experience
     ↓
     Acquisition Preferences
     ========================= */

  const handleIndustryExperienceContinue = (data: {
    industries: string[];
    years: string;
    roles: string[];
  }) => {
    console.log(
      "Industry experience:",
      data
    );

    setActiveTab("acquisition-preferences");
  };

  /* =========================
     Acquisition Preferences

     Finances will be connected once
     that section is implemented.
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
  }) => {
    console.log(
      "Acquisition preferences:",
      data
    );

    /*
     * Finances will be connected here
     * once the Finances section is implemented.
     */
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
          onImageChange={() =>
            setIsImageModalOpen(true)
          }
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
            initialAbout="Placeholder text for a longer response, spanning multiple lines."
            initialRegions={[
              "Location 1",
              "Location 2",
              "Location 3",
            ]}
            initialIndustries={[]}
            onContinue={handleOverviewContinue}
          />
        )}

        {activeTab === "industry-experience" && (
          <IndustryExperienceSection
            initialIndustries={[
              "Industry 1",
              "Industry 2",
              "Industry 3",
            ]}
            initialYears=""
            initialRoles={[
              "Role 1",
              "Role 2",
              "Role 3",
            ]}
            onBack={() =>
              setActiveTab("overview")
            }
            onContinue={
              handleIndustryExperienceContinue
            }
          />
        )}

        {activeTab === "acquisition-preferences" && (
          <AcquisitionPreferencesSection
            initialAcquisitionPreferences=""
            initialMotivation=""
            initialInvolvement="operator"
            initialTimeline="exploring"
            onBack={() =>
              setActiveTab("industry-experience")
            }
            onContinue={
              handleAcquisitionPreferencesContinue
            }
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
          onClose={() =>
            setIsImageModalOpen(false)
          }
          onDone={handleProfileImageDone}
        />
      </div>
    </main>
  );
}
