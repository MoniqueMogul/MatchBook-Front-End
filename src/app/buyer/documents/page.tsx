"use client";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import DocumentsDashboard from "@/components/buyer/documents/DocumentsDashboard";
import { getDocumentsDemoData } from "@/lib/api/documents/documents";

import "./page.css";

export default function BuyerDocumentsPage() {
  const documentsData = getDocumentsDemoData();

  return (
    <div className="buyer-documents-page">
      <DashboardSidebar />

      <div className="buyer-documents-page__main">
        <DocumentsDashboard data={documentsData} />
      </div>
    </div>
  );
}
