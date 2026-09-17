import api from "./client";

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

/**
 * GET /intake/buyers/preferences
 *
 * Authentication is handled automatically by the shared axios client.
 */
export async function getBuyerPreferences(): Promise<BuyerPreferences> {
  const response = await api.get<BuyerPreferences>(
    "/intake/buyers/preferences",
  );

  return response.data;
}

/**
 * PUT /intake/buyers/preferences
 *
 * Authentication is handled automatically by the shared axios client.
 */
export async function saveBuyerPreferences(
  payload: BuyerPreferencesPayload,
): Promise<BuyerPreferences> {
  const response = await api.put<BuyerPreferences>(
    "/intake/buyers/preferences",
    payload,
  );

  return response.data;
}