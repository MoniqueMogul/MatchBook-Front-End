import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerListings from "@/components/seller/SellerListings";

import "./page.css";

export default function SellerListingsPage() {
  return (
    <div className="seller-listings-page">
      <SellerSidebar />
      <div className="seller-listings-page__main">
        <SellerListings />
      </div>
    </div>
  );
}