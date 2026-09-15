import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import BuyerProfileEdit from "@/components/buyer/profile/BuyerProfileEdit";

import "./page.css";

export default function BuyerProfileEditPage() {
  return (
    <div className="buyer-profile-edit-page">
      <DashboardSidebar />

      <div className="buyer-profile-edit-page__main">
        <BuyerProfileEdit />
      </div>
    </div>
  );
}