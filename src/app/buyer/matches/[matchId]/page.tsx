"use client";

import ContentSkeleton from "@/components/common/ContentSkeleton";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import MatchDetail from "@/components/buyer/matching/MatchDetail";
import { getBuyerMatchViewData } from "@/lib/api/matching/matching";
import type { BuyerMatchViewData } from "@/lib/api/matching/matching.types";

import "./page.css";

export default function BuyerMatchDetailPage() {
  const params = useParams<{ matchId: string }>();

  const matchId = Array.isArray(params.matchId)
    ? params.matchId[0]
    : params.matchId;

  const [matchData, setMatchData] =
    useState<BuyerMatchViewData | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!matchId) {
      return;
    }

    let isActive = true;

    getBuyerMatchViewData(matchId)
      .then((data) => {
        if (isActive) {
          setMatchData(data);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setMatchData(null);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load this match.",
          );
        }
      });

    return () => {
      isActive = false;
    };
  }, [matchId]);

  return (
    <div className="buyer-match-page">
      <DashboardSidebar />

      <div className="buyer-match-page__main">
        {!matchId || loadError ? (
          <div
            className="buyer-match-page__state"
            role="alert"
          >
            <h1>Match unavailable</h1>
            <p>
              {loadError ||
                "A valid match identifier is required."}
            </p>
          </div>
        ) : matchData?.matchId === matchId ? (
          <MatchDetail data={matchData} />
        ) : (
          <ContentSkeleton shape="business" label="Loading match details" />
        )}
      </div>
    </div>
  );
}
