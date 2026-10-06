"use client";

import { useRef, useState } from "react";
import { explainBuyerMatch } from "@/lib/api/matching/matching";
import ContentSkeleton from "@/components/common/ContentSkeleton";

export default function MatchExplanation({ matchId }: { matchId: string }) {
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pending = useRef(false);
  async function explain() {
    if (pending.current) return;
    pending.current = true;
    setLoading(true); setError("");
    try { setExplanation(await explainBuyerMatch(matchId)); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to explain this match."); }
    finally { pending.current = false; setLoading(false); }
  }
  return <div className="match-detail__ai-explanation">
    {!explanation && <button type="button" disabled={loading} onClick={explain}>
      {loading ? "Generating explanation…" : error ? "Retry AI explanation" : "Explain Match"}
    </button>}
    {loading && <ContentSkeleton shape="options" label="Generating AI explanation" />}
    {error && <p role="alert">{error}</p>}
    {explanation && <div role="status"><h3>AI Explanation</h3><p>{explanation}</p>
      <small>Explains the saved match evidence. Your FIT score is unchanged.</small></div>}
  </div>;
}
