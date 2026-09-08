import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import AccountEdit from "@/components/buyer/account/AccountEdit";

import "./page.css";

export default function BuyerAccountEditPage() {
  return (
    <div className="buyer-account-edit-page">
      <DashboardSidebar />

      <div className="buyer-account-edit-page__main">
        <AccountEdit />
      </div>
    </div>
  );
}