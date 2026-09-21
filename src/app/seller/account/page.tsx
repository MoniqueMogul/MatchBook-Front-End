import SellerSidebar from "@/components/seller/SellerSidebar";
import AccountDetails from "@/components/seller/AccountDetails";

import "./page.css";

export default function SellerAccountPage() {
  return (
    <div className="seller-account-page">
      <SellerSidebar />
      <div className="seller-account-page__main">
        <AccountDetails />
      </div>
    </div>
  );
}