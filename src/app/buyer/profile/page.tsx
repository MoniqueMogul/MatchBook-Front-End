"use client";

import axios from "axios";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import BuyerProfilePreview from "@/components/buyer/profile/BuyerProfilePreview";
import ProfileSkeleton from "@/components/buyer/profile/ProfileSkeleton";
import { getBuyerPreferences } from "@/lib/api/buyerPreferences";
import { getBuyerProfile } from "@/lib/api/buyer";
import { getCurrentUser, getProfileImage } from "@/lib/api/user";
import { invalidateResource } from "@/store/apiCache";
import { useApiResource } from "@/hooks/useApiResource";
import "./page.css";

function BuyerProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useApiResource("buyerProfile", getBuyerProfile);
  const preferences = useApiResource("buyerPreferences", getBuyerPreferences);
  const user = useApiResource("user", getCurrentUser);
  const image = useApiResource("profileImage", getProfileImage);
  const missing = [profile.error, preferences.error].some(error => axios.isAxiosError(error) && error.response?.status === 404);
  useEffect(() => { if (missing) router.replace("/buyer-onboarding/profile"); }, [missing, router]);
  const tab = searchParams.get("tab");
  const initialTab = tab === "industry-experience" || tab === "acquisition-preferences" || tab === "finances" ? tab : "overview";
  const resources = [profile, preferences, user];
  const ready = resources.every(resource => resource.hasData);
  const failed = resources.some(resource => resource.error);
  return <>
    {ready && !missing ? <>
      {failed && <p role="alert">Could not refresh your profile. Showing the last saved information.</p>}
      <BuyerProfilePreview
        name={[user.data?.first_name, user.data?.last_name].filter(Boolean).join(" ") || "Profile"}
        profile={profile.data}
        preferences={preferences.data}
        location={[profile.data?.city, profile.data?.state].filter(Boolean).join(", ") || "Location"}
        memberType={profile.data?.buyer_type || "Member Type"}
        imageSrc={image.data?.url}
        phone={user.data?.phone}
        initialTab={initialTab}
      />
    </> : failed && !missing ? <div role="alert">
      <p>Could not load your profile. Please try again.</p>
      <button type="button" onClick={() => { invalidateResource("buyerProfile"); invalidateResource("buyerPreferences"); invalidateResource("user"); void Promise.allSettled([getBuyerProfile(), getBuyerPreferences(), getCurrentUser()]); }}>Try again</button>
    </div> : <ProfileSkeleton />}
  </>;
}

export default function BuyerProfilePage() {
  return <div className="buyer-profile-page">
    <DashboardSidebar />
    <div className="buyer-profile-page__main">
      <Suspense fallback={<ProfileSkeleton />}><BuyerProfilePageContent /></Suspense>
    </div>
  </div>;
}
