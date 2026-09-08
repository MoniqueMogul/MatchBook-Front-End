import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import BuyerProfileEdit from "@/components/buyer/profile/BuyerProfileEdit";

import "./page.css";

export default function BuyerProfilePage() {
  return (
    <div className="buyer-profile-page">
      <DashboardSidebar />

      <div className="buyer-profile-page__main">
        <BuyerProfileEdit />
      </div>
    </div>
  );
}