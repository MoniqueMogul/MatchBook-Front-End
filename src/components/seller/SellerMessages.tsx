"use client";

import { useEffect, useState } from "react";
import MessagesDashboard from "@/components/buyer/messages/MessagesDashboard";
import { getMessagesViewData } from "@/lib/api/messages/messages";
import type { MessagesViewData } from "@/lib/api/messages/messages.types";
import type { UserPersonal } from "@/lib/api/user";
import { Button } from "@/components/common/Button";

export default function SellerMessages({ user }: { user: UserPersonal }) {
  const [data, setData] = useState<MessagesViewData | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Seller";
    getMessagesViewData({ id: user.id, name, initials: name.split(/\s+/).map(part => part[0]).slice(0, 2).join("") }, true)
      .then(result => { if (!cancelled) setData(result); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [user, attempt]);
  return <div className="seller-messages">
    <p>Reply to verified buyers who have completed the NDA and contacted you about a matched business.</p>
    {error ? <div role="alert"><p>Unable to load messages. Please try again.</p>
      <Button onClick={() => { setError(false); setAttempt(value => value + 1); }}>Retry</Button></div>
      : data ? <MessagesDashboard data={data} sellerView /> : <p role="status">Loading your messages…</p>}
  </div>;
}
