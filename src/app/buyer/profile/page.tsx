import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import BuyerProfilePreview from "@/components/buyer/profile/BuyerProfilePreview";

import "./page.css";

export default function BuyerProfilePage() {
  return (
    <div className="buyer-profile-page">
      <DashboardSidebar />

      <div className="buyer-profile-page__main">
        <BuyerProfilePreview />
      </div>
    </div>
  );
}