/* Frontend view models for the Documents Figma. No backend contract yet. */

export type DocumentStatus =
  | "pending"
  | "approved"
  | "rejected";

export type DocumentVisibility =
  | "private"
  | "nda-signed";

export type FundingSource =
  | "personal-funds"
  | "401k-ira"
  | "sba-bank-loan"
  | "investor-funding"
  | "seller-financing"
  | "still-exploring";

export interface VerifiedDocument {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  uploadedAt: string;
  sizeBytes: number;
}

export interface DocumentsViewData {
  isVerified: boolean;
  documents: VerifiedDocument[];
}

export const fundingSourceOptions: Array<{
  value: FundingSource;
  label: string;
}> = [
  { value: "personal-funds", label: "Personal Fund" },
  { value: "401k-ira", label: "401K / IRA" },
  { value: "sba-bank-loan", label: "SBA / Bank Loan" },
  { value: "investor-funding", label: "Investor Funding" },
  { value: "seller-financing", label: "Seller Financing" },
  { value: "still-exploring", label: "Still Exploring" },
];

export const uploadSlotDefinitions = [
  { key: "tax-returns", label: "Tax Returns (2 Years)" },
  { key: "bank-statements", label: "Bank Statements" },
  { key: "401k-statement", label: "401K Statement" },
  { key: "lender-pre-approval", label: "Lender Pre-Approval Letter" },
  { key: "bank-pre-approval", label: "Bank Pre-Approval Letter" },
] as const;
