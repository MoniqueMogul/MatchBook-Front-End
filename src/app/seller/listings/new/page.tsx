import SellerSidebar from "@/components/seller/SellerSidebar";
import BusinessEditor from "@/components/seller/editor/BusinessEditor";
import "./page.css";

export default function NewBusinessPage() {
  return (
    <div className="seller-editor-page">
      <SellerSidebar />

      <main className="seller-editor-page__main">
        <BusinessEditor mode="create" />
      </main>
    </div>
  );
}