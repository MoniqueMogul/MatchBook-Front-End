"use client";

import { useParams } from "next/navigation";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import MatchDetail from "@/components/buyer/matching/MatchDetail";
import { getMatchViewDemoData } from "@/lib/api/matching/matching";

import "./page.css";

export default function BuyerMatchDetailPage() {
  const params = useParams<{ businessId: string }>();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  const matchData = getMatchViewDemoData(
    businessId ?? "demo-business",
  );

  return (
    <div className="buyer-match-page">
      <DashboardSidebar />

      <div className="buyer-match-page__main">
        <MatchDetail data={matchData} />
      </div>
    </div>
  );
}