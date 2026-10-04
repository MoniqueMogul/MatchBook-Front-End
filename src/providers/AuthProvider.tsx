"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { setCacheUser } from "@/store/apiCache";
import { supabase } from "@/lib/supabase";

/**
 * Mounts a global listener that keeps Supabase session state
 * in sync across the app (login, logout, token refresh, tab focus).
 *
 * No context value is exposed â€” components read directly from
 * `getAccessToken()` in `src/lib/supabase.ts`.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prime the session on mount
    supabase.auth.getSession();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCacheUser(session?.user.id ?? null);
      useAuthStore.getState().setUser(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}