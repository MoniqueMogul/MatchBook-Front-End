import api from "./client";
import type { ApiTargetLocation } from "./buyerPreferences.types";

export async function searchLocations(
  query: string,
  limit = 8,
): Promise<ApiTargetLocation[]> {
  const response = await api.get<ApiTargetLocation[]>(
    "/intake/locations/autocomplete",
    {
      params: {
        q: query,
        limit,
      },
    },
  );

  return response.data;
}
/** The same structured values are used for buyer preferences and seller businesses. */
export function toStructuredLocation(location: Pick<ApiTargetLocation, "city" | "state" | "county" | "zip_code" | "country_code">) {
  const clean = (value?: string | null) => value?.trim() || null;
  return { city: clean(location.city), state: clean(location.state), county: clean(location.county),
    zip_code: clean(location.zip_code), country_code: clean(location.country_code)?.toUpperCase() ?? null };
}
