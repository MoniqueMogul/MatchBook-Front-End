"use client";

import { useParams } from "next/navigation";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import MatchDetail from "@/components/buyer/matching/MatchDetail";
import { getMatchViewDemoData } from "@/lib/api/matching/matching";

import "./page.css";

export default function BuyerMatchDetailPage() {
  const params = useParams<{ matchId: string }>();

  const matchId = Array.isArray(params.matchId)
    ? params.matchId[0]
    : params.matchId;

  const matchData = getMatchViewDemoData(
    matchId ?? "demo-match",
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
