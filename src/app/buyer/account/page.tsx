"use client";

import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import AccountDetails from "@/components/buyer/account/AccountDetails";
import ProfileSkeleton from "@/components/buyer/profile/ProfileSkeleton";
import { getBuyerProfile } from "@/lib/api/buyer";
import { getCurrentUser } from "@/lib/api/user";
import { invalidateResource } from "@/store/apiCache";
import { useApiResource } from "@/hooks/useApiResource";
import "./page.css";

export default function BuyerAccountPage() {
  const router = useRouter();
  const profile = useApiResource("buyerProfile", getBuyerProfile);
  const user = useApiResource("user", getCurrentUser);
  const ready = profile.hasData && user.hasData;
  const failed = profile.error || user.error;
  return <div className="buyer-account-page">
    <DashboardSidebar />
    <div className="buyer-account-page__main">
      {failed && <p role="alert">{ready ? "Could not refresh your account. Showing the last saved information." : "Could not load your account. Please try again."}</p>}
      {ready ? <AccountDetails
        firstName={user.data?.first_name ?? ""}
        lastName={user.data?.last_name ?? ""}
        email={user.data?.email ?? ""}
        region={[profile.data?.city, profile.data?.state].filter(Boolean).join(", ") || "Not available"}
        phone={user.data?.phone ?? ""}
        onEdit={() => router.push("/buyer/account/edit")}
      /> : !failed ? <ProfileSkeleton /> : <button type="button" onClick={() => { invalidateResource("buyerProfile"); invalidateResource("user"); void Promise.allSettled([getBuyerProfile(), getCurrentUser()]); }}>Try again</button>}
    </div>
  </div>;
}
