export interface DimensionScore {
  score: number;
  weight: number;
  contribution: number;
}

export interface MatchEvaluation {
  buyer_id: string | number;
  business_id: string | number;

  eligible: boolean;
  failed_constraints: string[];

  score: number | null;
  percentage: number | null;

  dimensions: Record<string, DimensionScore>;

  meets_threshold: boolean;
}

export interface RankedMatch {
  rank: number;
  evaluation: MatchEvaluation;
}

/**
 * Business-facing information displayed on the Buyer Match View.
 *
 * Matching percentages and dimension scores must come from the
 * deterministic Matching Engine. This interface only represents
 * business/listing information displayed alongside those results.
 */
export interface MatchBusinessDetails {
  id: string;

  name: string;
  city: string;
  state: string;

  description: string;
  imageUrl?: string;

  industry: string;
  acquisitionType: string;
  yearsInOperation: number | null;
  employees: number | null;

  askingPrice: number | null;
  annualRevenueMin: number | null;
  annualRevenueMax: number | null;
  annualProfit: number | null;

  ownerHoursPerWeek: number | null;

  reasonForSelling: string;
  desiredTimeline: string;
  transitionSupport: string;

  propertyType: string;
  leaseTermRemaining: string;

  includedAssets: string[];

  estimatedProfitMargin: number | null;
}

export interface MatchHighlight {
  label: string;
  type: "positive" | "warning";
}

/**
 * Complete view model consumed by the Buyer Match View.
 *
 * `match` contains deterministic Matching Engine output.
 * `business` contains business/listing display information.
 */

export type FinancialVerificationStatus =
  | "unverified"
  | "verified";

export interface FinancialMetricPeriod {
  fiscalYear: string;
  revenue: number;
  sde: number;
  sdeMargin: number;
  ebitdaMargin: number;
  workingCapital: number;
}

export interface FinancialVerificationDetails {
  status: FinancialVerificationStatus;
  periods: FinancialMetricPeriod[];
}

export interface BuyerMatchViewData {
  matchId: string;
  match: RankedMatch;
  business: MatchBusinessDetails;
  highlights: MatchHighlight[];
  financialVerification: FinancialVerificationDetails;

  ndaRequired: boolean;
  ndaSigned: boolean;
}