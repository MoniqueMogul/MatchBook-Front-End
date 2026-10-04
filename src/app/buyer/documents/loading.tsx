import Sidebar from "@/components/dashboard/Sidebar";
import ContentSkeleton from "@/components/common/ContentSkeleton";
import "@/components/buyer/documents/DocumentsDashboard.css";
import "./page.css";

export default function Loading() {
  return <div className="buyer-documents-page">
    <Sidebar activeItem="documents" />
    <div className="buyer-documents-page__main"><main className="documents-dashboard">
      <h1>Documents</h1>
      <ContentSkeleton shape="documents" label="Loading documents" />
    </main></div>
  </div>;
}
