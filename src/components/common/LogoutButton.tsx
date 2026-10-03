"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useBuyerOnboardingStore } from "@/store/useBuyerOnboardingStore";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = async () => {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      useBuyerOnboardingStore.getState().clearActiveUser();
      useAuthStore.setState({ email: "", role: null, step: 1 });
      window.location.replace("/signin");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not log out. Please try again.");
      setBusy(false);
    }
  };
  return <div>
    <button type="button" className="account-details__edit" onClick={logout} disabled={busy}>
      {busy ? "Logging out…" : "Logout"}
    </button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
