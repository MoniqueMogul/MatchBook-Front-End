import SellerSidebar from "@/components/seller/SellerSidebar";
import AccountDetailsEdit from "@/components/seller/AccountDetailsEdit";

import "./page.css";

export default function SellerAccountEditPage() {
  return (
    <div className="seller-account-edit-page">
      <SellerSidebar />
      <div className="seller-account-edit-page__main">
        <AccountDetailsEdit />
      </div>
    </div>
  );
}