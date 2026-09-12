// src/lib/api/buyerPreferences.ts

export interface TargetLocation {
  provider: "locationiq";
  place_id: string;
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string | null;
  county?: string | null;
  state?: string | null;
  country?: string | null;
  country_code?: string | null;
}

export type DealPreference =
  | "cash"
  | "financing"
  | "either";

export type RealEstatePreference =
  | "included"
  | "lease"
  | "either";

export interface BuyerPreferences {
  id?: string;
  buyer_id?: string;

  target_industries?: string[] | null;
  target_locations?: TargetLocation[] | null;

  maximum_purchase_price?: number | null;

  minimum_required_sde?: number | null;
  preferred_sde?: number | null;

  minimum_required_arr?: number | null;
  preferred_arr?: number | null;

  preferred_owner_hours_per_week?: number | null;

  required_transition_training_days?: number | null;

  deal_preference?: DealPreference | null;

  real_estate_preference?: RealEstatePreference | null;

  minimum_years_in_operation?: number | null;

  accepts_customer_concentration_above_25_percent?: boolean | null;

  preferred_acquisition_timeline?: string | null;

  created_at?: string;
  updated_at?: string;
}

/*
 * Only fields that the backend accepts for PUT /intake/buyers/preferences.
 *
 * Do NOT send id, buyer_id, created_at or updated_at.
 */
export interface BuyerPreferencesPayload {
  target_industries?: string[] | null;
  target_locations?: TargetLocation[] | null;

  maximum_purchase_price?: number | null;

  minimum_required_sde?: number | null;
  preferred_sde?: number | null;

  minimum_required_arr?: number | null;
  preferred_arr?: number | null;

  preferred_owner_hours_per_week?: number | null;

  required_transition_training_days?: number | null;

  deal_preference?: DealPreference | null;

  real_estate_preference?: RealEstatePreference | null;

  minimum_years_in_operation?: number | null;

  accepts_customer_concentration_above_25_percent?: boolean | null;

  preferred_acquisition_timeline?: string | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers ?? {}),
      },
    },
  );

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const error = await response.json();

      if (typeof error?.detail === "string") {
        message = error.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

/**
 * GET /intake/buyers/preferences
 */
export async function getBuyerPreferences(
  accessToken: string,
): Promise<BuyerPreferences> {
  return request<BuyerPreferences>(
    "/intake/buyers/preferences",
    accessToken,
    {
      method: "GET",
    },
  );
}

/**
 * PUT /intake/buyers/preferences
 */
export async function saveBuyerPreferences(
  accessToken: string,
  payload: BuyerPreferencesPayload,
): Promise<BuyerPreferences> {
  return request<BuyerPreferences>(
    "/intake/buyers/preferences",
    accessToken,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * GET /intake/locations/autocomplete
 */
export async function searchBuyerLocations(
  accessToken: string,
  query: string,
): Promise<TargetLocation[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    limit: "8",
  });

  return request<TargetLocation[]>(
    `/intake/locations/autocomplete?${params.toString()}`,
    accessToken,
    {
      method: "GET",
    },
  );
}