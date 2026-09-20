import SellerSidebar from "@/components/seller/SellerSidebar";
import BusinessPreview from "@/components/seller/BusinessPreview";

import "./page.css";

export default function SellerBusinessPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="seller-business-preview-page">
      <SellerSidebar />
      <div className="seller-business-preview-page__main">
        <BusinessPreview businessId={params.id} />
      </div>
    </div>
  );
}