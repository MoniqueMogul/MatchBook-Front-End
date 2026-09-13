/* =====================================================
   Backend API contract types
   Mirror the FastAPI backend shape for:
     - /intake/buyers/preferences
     - /intake/buyers/readiness
   ===================================================== */

export interface ApiBuyerPreferences {
  target_industries?: string[];
  target_locations?: string[];
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

/* =====================================================
   UI-side types
   Reflect the current AcquisitionPreferencesSection state.
   Only a subset maps to the API — the rest stay in local
   UI state and are not sent.
   ===================================================== */

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