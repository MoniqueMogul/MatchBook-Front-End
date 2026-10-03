/* =====================================================
   Backend API contract types
   ===================================================== */

export interface ApiTargetLocation {
  provider: "locationiq";
  place_id: string;
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string | null;
  county?: string | null;
  zip_code?: string | null;
  state?: string | null;
  country?: string | null;
  country_code?: string | null;
}

export interface ApiBuyerPreferences {
  target_industries?: string[];
  target_locations?: ApiTargetLocation[];

  maximum_purchase_price?: number;

  minimum_required_sde?: number;
  preferred_sde?: number;

  minimum_required_arr?: number;
  preferred_arr?: number;

  preferred_owner_hours_per_week?: number;
  required_transition_training_days?: number;

  deal_preference?: string;
  real_estate_preference?: string;

  minimum_years_in_operation?: number;

  accepts_customer_concentration_above_25_percent?: boolean;

  preferred_acquisition_timeline?: string;
}

export interface ApiBuyerReadiness {
  ready: boolean;
  missing_fields: string[];
}

/*
 * UI state for the Acquisition Preferences section.
 *
 * Some of these fields currently exist only in the UI
 * and are intentionally not sent to the backend yet.
 */
export interface UiAcquisitionPreferences {
  industries: string[];

  companySizes: string[];

  minimumYearsInOperation: string;

  minimumARR: string;

  minimumSDE: string;

  customerConcentration: string;

  sellerTraining: string;

  zipcode: string;

  searchRadius: number;

  acquisitionPreferences: string;

  motivation: string;

  involvement: string;

  timeline: string;
}