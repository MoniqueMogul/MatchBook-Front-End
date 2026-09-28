import axios from "axios";

import api from "@/lib/api/client";

import type {
  ApiMatchDetailResponse,
  BuyerMatchViewData,
  DimensionScore,
  MatchBusinessDetails,
  MatchHighlight,
  RankedMatch,
} from "./matching.types";

/**
 * Recalculate and persist ranked matches for a buyer.
 *
 * Backend:
 * POST /api/matches/recalculate/{buyer_id}
 */
export async function recalculateBuyerMatches(
  buyerId: string,
): Promise<RankedMatch[]> {
  const response = await api.post<RankedMatch[]>(
    `/api/matches/recalculate/${buyerId}`,
  );

  return response.data;
}

/**
 * Load one persisted match owned by the authenticated buyer.
 *
 * The route parameter must be the backend Match UUID, not a
 * business ID. The backend enforces buyer ownership.
 */
export async function getBuyerMatchViewData(
  matchId: string,
): Promise<BuyerMatchViewData> {
  try {
    const response = await api.get<ApiMatchDetailResponse>(
      `/api/matches/${matchId}`,
    );

    return mapMatchDetail(response.data);
  } catch (error) {
    if (axios.isAxiosError<{ detail?: string }>(error)) {
      const detail = error.response?.data?.detail;

      if (detail) {
        throw new Error(detail);
      }

      if (error.response?.status === 401) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      if (error.response?.status === 404) {
        throw new Error(
          "This match could not be found for your buyer account.",
        );
      }
    }

    throw new Error("Unable to load this match.");
  }
}

function mapMatchDetail(
  response: ApiMatchDetailResponse,
): BuyerMatchViewData {
  const score = parseDecimal(response.score) ?? 0;
  const askingPrice = parseDecimal(
    response.business.asking_price,
  );
  const annualRevenue = parseDecimal(response.business.arr);
  const annualProfit = parseDecimal(response.business.sde);

  const dimensions = response.dimensions.reduce<
    Record<string, DimensionScore>
  >((result, dimension) => {
    result[dimension.dimension] = {
      score: dimension.alignment_score,
      weight: dimension.weight,
      contribution: dimension.contribution,
    };

    return result;
  }, {});

  const highlights: MatchHighlight[] =
    response.dimensions.map((dimension) => ({
      label: formatDimensionLabel(dimension.dimension),
      type:
        dimension.alignment_score >= 0.8
          ? "positive"
          : "warning",
    }));

  const business: MatchBusinessDetails = {
    id: response.business.id,
    name:
      response.business.dba ??
      response.business.legal_name ??
      "Confidential business",
    city: response.business.city,
    state: response.business.state,
    description:
      "Additional business details are available after the NDA is completed.",
    industry: response.business.industry,
    acquisitionType: "Not provided",
    yearsInOperation:
      response.business.years_in_operation,
    employees: null,
    askingPrice,
    annualRevenueMin: annualRevenue,
    annualRevenueMax: annualRevenue,
    annualProfit,
    ownerHoursPerWeek: null,
    reasonForSelling: "Not provided",
    desiredTimeline: "Not provided",
    transitionSupport: "Not provided",
    propertyType: "Not provided",
    leaseTermRemaining: "Not provided",
    includedAssets: [],
    estimatedProfitMargin:
      annualRevenue !== null &&
      annualRevenue > 0 &&
      annualProfit !== null
        ? Math.round((annualProfit / annualRevenue) * 100)
        : null,
  };

  return {
    matchId: response.id,
    business,
    match: {
      rank: 1,
      evaluation: {
        buyer_id: response.buyer_id,
        business_id: response.business.id,
        eligible: true,
        failed_constraints: [],
        score,
        percentage: Math.round(score * 100),
        dimensions,
        meets_threshold: true,
      },
    },
    highlights,
    financialVerification: {
      status: "unverified",
      periods: [],
    },
    ndaRequired: true,
    ndaSigned: false,
  };
}

function parseDecimal(
  value: string | null,
): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatDimensionLabel(
  dimension: string,
): string {
  return dimension
    .split("_")
    .map((word) =>
      word.toLowerCase() === "sde"
        ? "SDE"
        : `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(" ");
}
