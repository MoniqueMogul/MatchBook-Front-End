import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type ResourceKey = "user" | "buyerProfile" | "buyerPreferences" | "profileImage" | "industries" | "businessModels";
export interface CacheEntry {
  data?: unknown;
  hasData: boolean;
  error?: unknown;
  updatedAt: number;
  expiresAt: number;
}
interface CacheState {
  userId: string | null;
  entries: Partial<Record<ResourceKey, CacheEntry>>;
}
// Memory only: never persist profile data or use this cache for authorization.
export const useApiCache = create<CacheState>(() => ({ userId: null, entries: {} }));
const pending = new Map<ResourceKey, Promise<unknown>>();
const versions = new Map<ResourceKey, number>();
let epoch = 0;

export function setCacheUser(userId: string | null) {
  if (useApiCache.getState().userId === userId) return;
  epoch++;
  pending.clear();
  versions.clear();
  useApiCache.setState({ userId, entries: {} });
}
async function scope() {
  const observedEpoch = epoch;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user.id ?? null;
  if (epoch !== observedEpoch && useApiCache.getState().userId !== userId) {
    throw new Error("Your session changed. Please try again.");
  }
  setCacheUser(userId);
  if (!data.session) throw new Error("You are not authenticated.");
  return epoch;
}
function status(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status;
}
function put(key: ResourceKey, entry: CacheEntry) {
  useApiCache.setState(state => ({ entries: { ...state.entries, [key]: entry } }));
}
export function invalidateResource(key: ResourceKey) {
  versions.set(key, (versions.get(key) ?? 0) + 1);
  pending.delete(key);
  const entry = useApiCache.getState().entries[key];
  if (entry) put(key, { ...entry, expiresAt: 0 });
}

export async function cachedRead<T>(key: ResourceKey, load: () => Promise<T>, ttl: number | ((value: T) => number) = 60_000): Promise<T> {
  const requestEpoch = await scope();
  const entry = useApiCache.getState().entries[key];
  if (entry && entry.expiresAt > Date.now()) {
    if (entry.error) throw entry.error;
    if (entry.hasData) return entry.data as T;
  }
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;
  const version = versions.get(key) ?? 0;
  const current = () => epoch === requestEpoch && (versions.get(key) ?? 0) === version;
  const request = load().then(value => {
    if (epoch !== requestEpoch) throw new Error("Your session changed. Please try again.");
    if (current()) {
      const now = Date.now();
      put(key, { data: value, hasData: true, updatedAt: now, expiresAt: now + (typeof ttl === "function" ? ttl(value) : ttl) });
    }
    return value;
  }).catch(error => {
    if (current()) {
      const previous = useApiCache.getState().entries[key];
      // Expected absence is cached briefly and still rejected to existing callers.
      const absent = status(error) === 404;
      put(key, { data: absent ? undefined : previous?.data, hasData: !absent && !!previous?.hasData,
        updatedAt: absent ? Date.now() : previous?.updatedAt ?? 0,
        expiresAt: Date.now() + (absent ? 15_000 : 5_000), error });
    }
    throw error;
  }).finally(() => { if (pending.get(key) === request) pending.delete(key); });
  pending.set(key, request);
  return request;
}

export async function cachedWrite<T>(key: ResourceKey, write: () => Promise<T>, invalidate: ResourceKey[] = []): Promise<T> {
  const requestEpoch = await scope();
  invalidateResource(key);
  const version = versions.get(key);
  const value = await write();
  if (epoch === requestEpoch && versions.get(key) === version) {
    // Retire reads started during the mutation, too.
    invalidateResource(key);
    put(key, { data: value, hasData: true, updatedAt: Date.now(), expiresAt: Date.now() + 60_000 });
    invalidate.forEach(invalidateResource);
  }
  return value;
}
