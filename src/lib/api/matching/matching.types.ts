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
export type ApiMatchStatus =
  | "matched"
  | "interested"
  | "verification"
  | "nda"
  | "due_diligence"
  | "offer"
  | "loi"
  | "financing"
  | "closing"
  | "completed"
  | "rejected"
  | "expired";

export interface ApiBusinessMatchSummary {
  id: string;
  profile_image_url?: string | null;
  legal_name: string | null;
  dba: string | null;
  industry: string;
  city: string;
  state: string;
  asking_price: string | null;
  sde: string | null;
  arr: string | null;
  years_in_operation: number | null;
}

export interface ApiMatchDimensionResponse {
  dimension: string;
  alignment_score: number;
  weight: number;
  contribution: number;
}

export interface ApiMatchDetailResponse {
  id: string;
  buyer_id: string;
  score: string;
  status: ApiMatchStatus;
  matching_version: string;
  business: ApiBusinessMatchSummary;
  dimensions: ApiMatchDimensionResponse[];
  created_at: string;
  updated_at: string;
}

export interface ApiMatchResponse {
  id: string;
  score: string;
  status: ApiMatchStatus;
  business: ApiBusinessMatchSummary;
  created_at: string;
  updated_at: string;
}

export interface ApiBuyerMatchesResponse {
  buyer_id: string;
  matches: ApiMatchResponse[];
  limit: number;
  offset: number;
  has_more: boolean;
}
