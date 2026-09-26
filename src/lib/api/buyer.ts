import api from "./client";

export type BuyerType =
  | "first_time_owner"
  | "existing_business_owner"
  | "investor_group"
  | "family_office"
  | "private_equity";

export interface BuyerProfile {
  id: string;
  user_id: string;

  buyer_type: BuyerType;

  current_industry: string | null;
  current_position: string | null;
  about_me: string | null;
  business_experience_years: number | null;
  relevant_experience: string | null;
  available_hours_per_week: number | null;

  city: string | null;
  county: string | null;
  state: string | null;
  zip_code: string | null;

  verification_status: string;

  created_at: string;
  updated_at: string;
}

export interface BuyerProfilePayload {
  buyer_type?: BuyerType | null;

  current_industry?: string | null;
  current_position?: string | null;
  about_me?: string | null;
  business_experience_years?: number | null;
  relevant_experience?: string | null;
  available_hours_per_week?: number | null;

  city?: string | null;
  county?: string | null;
  state?: string | null;
  zip_code?: string | null;
}

/**
 * GET /intake/buyers/profile
 *
 * Retrieves the existing buyer profile for the
 * authenticated user.
 */
export async function getBuyerProfile(): Promise<BuyerProfile> {
  const response = await api.get<BuyerProfile>(
    "/intake/buyers/profile",
  );

  return response.data;
}

/**
 * PUT /intake/buyers/profile
 *
 * Upsert behavior:
 * - No profile exists → creates the profile
 * - Profile exists → updates the supplied fields
 * - Omitted fields are preserved by the backend
 *
 * This same endpoint is used throughout onboarding
 * and for subsequent buyer profile edits.
 */
export async function upsertBuyerProfile(
  payload: BuyerProfilePayload,
): Promise<BuyerProfile> {
  const response = await api.put<BuyerProfile>(
    "/intake/buyers/profile",
    payload,
  );

  return response.data;
}