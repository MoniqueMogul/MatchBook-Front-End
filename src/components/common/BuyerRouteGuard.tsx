"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { buyerRouteRedirect } from "@/lib/auth/roleRouting";
import { useAuthStore } from "@/store/authStore";
import ProfileSkeleton from "@/components/buyer/profile/ProfileSkeleton";

export default function BuyerRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const userId = useAuthStore(state => state.userId);
  const role = useAuthStore(state => state.role);
  const [allowedUser, setAllowedUser] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    buyerRouteRedirect().then(path => {
      if (!active) return;
      if (path) router.replace(path);
      else setAllowedUser(useAuthStore.getState().userId);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [router, userId, role, attempt]);
  if (allowedUser && allowedUser === userId && role === "buyer") return children;
  return <main style={{ padding: "32px", maxWidth: "1040px", margin: "0 auto" }}>
    {error ? <div role="alert"><p>Could not check your account. Please try again.</p>
      <button type="button" onClick={() => { setError(false); setAttempt(value => value + 1); }}>Try again</button>
    </div> : <ProfileSkeleton />}
  </main>;
}
