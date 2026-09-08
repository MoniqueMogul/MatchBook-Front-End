"use client";

import { useState } from "react";

import ProfileEditHeader from "./ProfileEditHeader";
import ProfileTabs, { type ProfileTab } from "./ProfileTabs";
import EditOverviewSection from "./EditOverviewSection";
import ProfileFormActions from "./ProfileFormActions";

import "./BuyerProfileEdit.css";

export default function BuyerProfileEdit() {
  const [activeTab, setActiveTab] =
    useState<ProfileTab>("overview");

  const [location, setLocation] =
    useState("Original Location");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    /*
     * API integration will be added here once
     * the backend contract is finalized.
     */
    console.log("Profile save requested");

    setSaving(false);
  };

  const handleCancel = () => {
    console.log("Profile edit cancelled");
  };

  const handleContinue = (data: {
    about: string;
    regions: string[];
    industries: string[];
  }) => {
    console.log("Continue with overview data:", data);
  };

  return (
    <main className="buyer-profile-edit">
      <div className="buyer-profile-edit__content">
        <ProfileEditHeader
          name="Original Name"
          location={location}
          onLocationChange={setLocation}
          onPreview={() => {
            console.log("Switch to preview");
          }}
        />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "overview" && (
          <>
            <EditOverviewSection
              initialAbout="Placeholder text for a longer response, spanning multiple lines."
              initialRegions={[
                "Location 1",
                "Location 2",
                "Location 3",
              ]}
              initialIndustries={[]}
              onContinue={handleContinue}
            />

            <ProfileFormActions
              onCancel={handleCancel}
              onSave={handleSave}
              saving={saving}
            />
          </>
        )}
      </div>
    </main>
  );
}