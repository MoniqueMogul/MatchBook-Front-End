import SellerSidebar from "@/components/seller/SellerSidebar";
import BusinessPreview from "@/components/seller/BusinessPreview";

import "./page.css";

export default async function SellerBusinessPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="seller-business-preview-page">
      <SellerSidebar />
      <div className="seller-business-preview-page__main">
        <BusinessPreview businessId={id} />
      </div>
    </div>
  );
}
