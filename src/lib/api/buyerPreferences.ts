import api from "@/lib/api/client";
import type {
  ApiBuyerPreferences,
  ApiBuyerReadiness,
} from "./buyerPreferences.types";

/**
 * GET /intake/buyers/preferences
 */
export async function getBuyerPreferences(): Promise<ApiBuyerPreferences> {
  const res = await api.get<ApiBuyerPreferences>(
    "/intake/buyers/preferences"
  );
  return res.data;
}

/**
 * PUT /intake/buyers/preferences
 */
export async function updateBuyerPreferences(
  prefs: ApiBuyerPreferences
): Promise<ApiBuyerPreferences> {
  const res = await api.put<ApiBuyerPreferences>(
    "/intake/buyers/preferences",
    prefs
  );
  return res.data;
}

/**
 * GET /intake/buyers/readiness
 */
export async function getBuyerReadiness(): Promise<ApiBuyerReadiness> {
  const res = await api.get<ApiBuyerReadiness>(
    "/intake/buyers/readiness"
  );
  return res.data;
}