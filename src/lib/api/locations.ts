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