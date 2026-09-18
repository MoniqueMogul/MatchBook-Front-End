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

export interface BuyerProfileCreatePayload {
  buyer_type: BuyerType;

  current_industry?: string | null;
  current_position?: string | null;

  business_experience_years?: number | null;
  relevant_experience?: string | null;
  available_hours_per_week?: number | null;

  city?: string | null;
  county?: string | null;
  state?: string | null;
  zip_code?: string | null;
}

export interface BuyerProfileUpdatePayload {
  buyer_type?: BuyerType | null;

  current_industry?: string | null;
  current_position?: string | null;

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
 */
export async function getBuyerProfile(): Promise<BuyerProfile> {
  const response = await api.get<BuyerProfile>(
    "/intake/buyers/profile",
  );

  return response.data;
}

/**
 * POST /intake/buyers/profile
 */
export async function createBuyerProfile(
  payload: BuyerProfileCreatePayload,
): Promise<BuyerProfile> {
  const response = await api.post<BuyerProfile>(
    "/intake/buyers/profile",
    payload,
  );

  return response.data;
}

/**
 * PATCH /intake/buyers/profile
 */
export async function updateBuyerProfile(
  payload: BuyerProfileUpdatePayload,
): Promise<BuyerProfile> {
  const response = await api.patch<BuyerProfile>(
    "/intake/buyers/profile",
    payload,
  );

  return response.data;
}