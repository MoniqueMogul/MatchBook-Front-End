"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import ContentSkeleton from "@/components/common/ContentSkeleton";
import "./page.css";

export default function Loading() {
  return <div className="seller-page dashboard-shell">
    <Sidebar profileLabel="Listings" activeItem="profile" onNavigate={() => false} />
    <main className="seller-content">
      <h1>Listings</h1>
      <ContentSkeleton shape="listings" label="Loading your seller account" />
    </main>
  </div>;
}
