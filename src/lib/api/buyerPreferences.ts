import api from "./client";

export type DealPreference =
  | "cash"
  | "financing"
  | "either";

export type RealEstatePreference =
  | "included"
  | "lease"
  | "either";

export type BusinessType =
  | "sole_proprietorship"
  | "partnership"
  | "llc"
  | "s_corporation"
  | "c_corporation"
  | "nonprofit"
  | "other";

export interface TargetIndustryPreference {
  industry: string;
  sub_industries: string[];
}

export interface ApiTargetLocation {
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

interface BackendTargetLocation {
  state?: string | null;
  city?: string | null;
  county?: string | null;
  country_code?: string | null;
}

interface BackendBuyerPreferences {
  id?: string;
  buyer_id?: string;

  target_industry_preferences?:
    | TargetIndustryPreference[]
    | null;

  target_business_models?: string[] | null;
  target_business_types?: BusinessType[] | null;

  target_locations?:
    | BackendTargetLocation[]
    | null;

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

  accepts_customer_concentration_above_25_percent?:
    | boolean
    | null;

  preferred_acquisition_timeline?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface BuyerPreferences {
  id?: string;
  buyer_id?: string;

  target_industry_preferences?:
    | TargetIndustryPreference[]
    | null;

  target_business_models?: string[] | null;
  target_business_types?: BusinessType[] | null;

  target_locations?: ApiTargetLocation[] | null;

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

  accepts_customer_concentration_above_25_percent?:
    | boolean
    | null;

  preferred_acquisition_timeline?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface BuyerPreferencesPayload {
  target_industry_preferences?:
    | TargetIndustryPreference[]
    | null;

  target_business_models?: string[] | null;
  target_business_types?: BusinessType[] | null;

  target_locations?: ApiTargetLocation[] | null;

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

  accepts_customer_concentration_above_25_percent?:
    | boolean
    | null;

  preferred_acquisition_timeline?: string | null;
}

function normalizeBackendLocation(
  location: BackendTargetLocation,
  index: number,
): ApiTargetLocation {
  const displayName = [
    location.city,
    location.county,
    location.state,
    location.country_code,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    provider: "locationiq",
    place_id:
      `backend-location-${index}-${[
        location.city,
        location.county,
        location.state,
        location.country_code,
      ]
        .filter(Boolean)
        .join("-")}`,
    display_name: displayName || "Selected location",
    latitude: 0,
    longitude: 0,
    city: location.city ?? null,
    county: location.county ?? null,
    state: location.state ?? null,
    country_code: location.country_code ?? null,
  };
}

function normalizePreferences(
  data: BackendBuyerPreferences,
): BuyerPreferences {
  return {
    ...data,
    target_locations:
      data.target_locations?.map(
        normalizeBackendLocation,
      ) ?? null,
  };
}

function buildBackendPayload(
  payload: BuyerPreferencesPayload,
): Record<string, unknown> {
  return {
    ...payload,

    target_locations:
      payload.target_locations?.map(
        (location) => ({
          state: location.state ?? null,
          city: location.city ?? null,
          county: location.county ?? null,
          country_code:
            location.country_code ?? null,
        }),
      ) ?? null,
  };
}

/**
 * GET /intake/buyers/preferences
 */
export async function getBuyerPreferences(): Promise<BuyerPreferences> {
  const response =
    await api.get<BackendBuyerPreferences>(
      "/intake/buyers/preferences",
    );

  return normalizePreferences(response.data);
}

/**
 * PUT /intake/buyers/preferences
 */
export async function saveBuyerPreferences(
  payload: BuyerPreferencesPayload,
): Promise<BuyerPreferences> {
  const response =
    await api.put<BackendBuyerPreferences>(
      "/intake/buyers/preferences",
      buildBackendPayload(payload),
    );

  return normalizePreferences(response.data);
}

export interface BuyerReadiness {
  ready: boolean;
  missing_fields: string[];
  completion_percentage?: number;
  completed_fields?: number;
  total_required_fields?: number;
}

/**
 * GET /intake/buyers/readiness
 */
export async function getBuyerReadiness(): Promise<BuyerReadiness> {
  const response =
    await api.get<BuyerReadiness>(
      "/intake/buyers/readiness",
    );

  return response.data;
}
