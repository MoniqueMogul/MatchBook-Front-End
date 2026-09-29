import api from "@/lib/api/client";

import type {
  BuyerMatchViewData,
  MatchBusinessDetails,
  RankedMatch,
} from "./matching.types";

/**
 * Recalculate and persist ranked matches for a buyer.
 *
 * Backend:
 * POST /api/matches/recalculate/{buyer_id}
 *
 * The Matching Engine remains the source of truth for all
 * deterministic FIT scores and percentages.
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
 * Temporary presentation data for building the Match View while
 * the frontend retrieval contract for persisted matches/business
 * details is being finalized.
 *
 * IMPORTANT:
 * - This is demo/UI data only.
 * - It must not be treated as persisted backend data.
 * - Match percentages are kept inside the RankedMatch shape so the
 *   component can later consume the real Matching Engine response
 *   without changing its presentation contract.
 */
export function getMatchViewDemoData(
  businessId: string,
): BuyerMatchViewData {
  const business: MatchBusinessDetails = {
    id: businessId,

    name: "Specialty Coffee Roastery",
    city: "Portland",
    state: "OR",

    description:
      "Established specialty food and beverage business with a strong local customer base, recurring revenue, and an experienced operating team.",

    industry: "Specialty Food & Beverage",
    acquisitionType: "Full Sale",
    yearsInOperation: 12,
    employees: 3,

    askingPrice: 750000,
    annualRevenueMin: 800000,
    annualRevenueMax: 900000,
    annualProfit: 200000,

    ownerHoursPerWeek: 35,

    reasonForSelling: "Pursuing other opportunities",
    desiredTimeline: "Within 3-6 months",
    transitionSupport: "3-6 month handover",

    propertyType: "Leased",
    leaseTermRemaining: "3-5 years",

    includedAssets: [
      "Roasting equipment",
      "Delivery van",
      "POS system",
    ],

    estimatedProfitMargin: 24,
  };

  return {
    business,

    match: {
      rank: 1,

      evaluation: {
        buyer_id: "demo-buyer",
        business_id: businessId,

        eligible: true,
        failed_constraints: [],

        score: 0.92,
        percentage: 92,

        meets_threshold: true,

        dimensions: {
          purchase_price: {
            score: 0.94,
            weight: 0.3,
            contribution: 0.282,
          },

          geography: {
            score: 0.94,
            weight: 0,
            contribution: 0,
          },

          industry: {
            score: 1,
            weight: 0,
            contribution: 0,
          },

          sde: {
            score: 0.98,
            weight: 0.3,
            contribution: 0.294,
          },
        },
      },
    },

    highlights: [
      {
        label: "Transition Offered",
        type: "positive",
      },
      {
        label: "Asking Price in Range",
        type: "positive",
      },
      {
        label: "Cash Financing",
        type: "positive",
      },
      {
        label: "Geographical Region",
        type: "positive",
      },
      {
        label: "Owner 35 hrs/wk (Above Preferred <20 hrs)",
        type: "warning",
      },
    ],

    ndaRequired: true,
    ndaSigned: false,
  };
}
