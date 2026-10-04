"use client";

import { useEffect, useState } from "react";
import { useApiCache, type ResourceKey } from "@/store/apiCache";

// Read-only views revalidate; editable forms deliberately keep their own draft state.
export function useApiResource<T>(key: ResourceKey, load: () => Promise<T>) {
  const [sessionError, setSessionError] = useState<unknown>();
  const entry = useApiCache(state => state.entries[key]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState !== "hidden") void load().then(() => setSessionError(undefined), setSessionError); };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [key, load]);
  return { data: entry?.data as T | undefined, hasData: !!entry?.hasData, error: entry?.error ?? (!entry ? sessionError : undefined),
    loading: !sessionError && (!entry || (!entry.hasData && !entry.error)) };
}
