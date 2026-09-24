"use client";

import BuyerProfileEdit from "@/components/buyer/profile/BuyerProfileEdit";
import Sidebar from "@/components/dashboard/Sidebar";

import "./page.css";

export default function BuyerProfileOnboardingPage() {
  return (
    <div className="buyer-profile-onboarding-page">
      <Sidebar />

      <div className="buyer-profile-onboarding-page__main">
        <BuyerProfileEdit mode="onboarding" />
      </div>
    </div>
  );
}