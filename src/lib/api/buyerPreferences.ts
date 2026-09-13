/* =====================================================
   Buyer Preferences API helpers
   Endpoints:
     GET  /intake/buyers/preferences
     PUT  /intake/buyers/preferences
     GET  /intake/buyers/readiness

   Auth: Authorization: Bearer <supabase_access_token>
   The backend resolves the user from the JWT — do NOT send user_id.
   ===================================================== */

import type {
  ApiBuyerPreferences,
  ApiBuyerReadiness,
} from "./buyerPreferences.types";

/**
 * Fetch the current buyer's preferences.
 * Use on page load to pre-fill the Acquisition Preferences section.
 */
export async function getBuyerPreferences(): Promise<ApiBuyerPreferences> {
  // TODO: replace once shared axios client + token source are confirmed
  // const res = await api.get<ApiBuyerPreferences>("/intake/buyers/preferences");
  // return res.data;
  throw new Error(
    "getBuyerPreferences: waiting on shared axios client + token source"
  );
}

/**
 * Create or update the buyer's preferences.
 * Only send fields the backend supports — see buyerPreferences.mappers.ts
 */
export async function updateBuyerPreferences(
  prefs: ApiBuyerPreferences
): Promise<ApiBuyerPreferences> {
  // TODO: replace once shared axios client + token source are confirmed
  // const res = await api.put<ApiBuyerPreferences>(
  //   "/intake/buyers/preferences",
  //   prefs
  // );
  // return res.data;
  void prefs;
  throw new Error(
    "updateBuyerPreferences: waiting on shared axios client + token source"
  );
}

/**
 * Check whether the buyer intake is complete.
 * Returns `ready` + `missing_fields`.
 */
export async function getBuyerReadiness(): Promise<ApiBuyerReadiness> {
  // TODO: replace once shared axios client + token source are confirmed
  // const res = await api.get<ApiBuyerReadiness>("/intake/buyers/readiness");
  // return res.data;
  throw new Error(
    "getBuyerReadiness: waiting on shared axios client + token source"
  );
}