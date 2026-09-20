import api from "./client";

export type FundingSource =
  | "all_cash"
  | "sba_7a"
  | "conventional"
  | "investor_capital"
  | "seller_financing";

export type LenderApprovalStatus =
  | "pending"
  | "approved"
  | "denied"
  | "expired";

export type FinancialVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface BuyerFinancials {
  id?: string;

  buyer_id?: string;

  funding_source?: FundingSource | null;

  reported_cash_available?: number | null;

  verified_cash_amount?: number | null;

  financing_requested_amount?: number | null;

  financing_approved_amount?: number | null;

  lender_name?: string | null;

  lender_approval_status?: LenderApprovalStatus | null;

  verification_status?: FinancialVerificationStatus | null;

  created_at?: string;

  updated_at?: string;
}

export type BuyerFinancialsPayload = Omit<
  BuyerFinancials,
  "id" | "buyer_id" | "created_at" | "updated_at"
>;

// Keep these paths isolated.
// Replace them with the actual backend routes once Finance endpoints
// are added/exposed by the backend team.

export async function getBuyerFinancials(): Promise<BuyerFinancials> {
  const response = await api.get<BuyerFinancials>(
    "/intake/buyers/financials",
  );

  return response.data;
}

export async function updateBuyerFinancials(
  payload: BuyerFinancialsPayload,
): Promise<BuyerFinancials> {
  const response = await api.put<BuyerFinancials>(
    "/intake/buyers/financials",
    payload,
  );

  return response.data;
}