import axios from "axios";
import { supabase } from "@/lib/supabase";
import { getBuyerProfile } from "@/lib/api/buyer";
import { getBuyerReadiness } from "@/lib/api/buyerPreferences";
import { getSellerProfile, ensureSellerProfile } from "@/lib/api/seller";
import { useAuthStore } from "@/store/authStore";

type Role = "buyer" | "seller";
async function currentUserId() {
  const previousUserId = useAuthStore.getState().userId;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const id = data.session?.user.id ?? null;
  const activeUserId = useAuthStore.getState().userId;
  if (activeUserId !== previousUserId && activeUserId !== id) {
    throw new Error("Your session changed. Please sign in again.");
  }
  useAuthStore.getState().setUser(id);
  return id;
}
async function exists(load: () => Promise<{ id: string }>) {
  try {
    const profile = await load();
    if (!profile.id) throw new Error("Could not identify your account. Please try again.");
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return false;
    throw error;
  }
}
async function roles() {
  const [buyer, seller] = await Promise.all([exists(getBuyerProfile), exists(getSellerProfile)]);
  return { buyer, seller };
}
function remember(userId: string, role: Role) {
  if (useAuthStore.getState().userId !== userId) throw new Error("Your session changed. Please sign in again.");
  useAuthStore.getState().setRole(role);
}

// Authentication does not choose an operating role. Resolve both backend records.
export async function resolveSignInPath(): Promise<string> {
  const userId = await currentUserId();
  if (!userId) return "/signin";
  const { buyer, seller } = await roles();
  if (buyer && !seller) { remember(userId, "buyer"); return "/buyer-dashboard"; }
  if (seller && !buyer) { remember(userId, "seller"); return "/seller"; }
  // Reset any previous choice: dual-profile and new users must choose explicitly.
  if (useAuthStore.getState().userId !== userId) throw new Error("Your session changed. Please sign in again.");
  useAuthStore.getState().setRole(null);
  return "/role-selection";
}

export async function selectRolePath(role: Role): Promise<string> {
  const userId = await currentUserId();
  if (!userId) return "/signin";
  if (role === "seller") {
    await ensureSellerProfile();
    remember(userId, "seller");
    return "/seller";
  }
  const { buyer, seller } = await roles();
  if (seller && !buyer) { remember(userId, "seller"); return "/seller"; }
  remember(userId, "buyer");
  if (!buyer) return "/buyer-onboarding";
  try {
    return (await getBuyerReadiness()).ready ? "/buyer-dashboard" : "/buyer-onboarding";
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return "/buyer-onboarding";
    throw error;
  }
}

// A session-scoped choice survives navigation, but never a logout/account change.
// No child Buyer component mounts until this check permits it.
export async function buyerRouteRedirect(): Promise<string | null> {
  const userId = await currentUserId();
  if (!userId) return "/signin";
  const choice = useAuthStore.getState().role;
  if (choice === "seller") return "/seller";
  if (choice === "buyer") return null;
  const path = await resolveSignInPath();
  return path === "/buyer-dashboard" ? null : path;
}
