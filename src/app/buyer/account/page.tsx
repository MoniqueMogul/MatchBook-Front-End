import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import AccountDetails from "@/components/buyer/account/AccountDetails";

import "./page.css";

export default function BuyerAccountPage() {
  return (
    <div className="buyer-account-page">
      <DashboardSidebar />

      <div className="buyer-account-page__main">
        <AccountDetails />
      </div>
    </div>
  );
}