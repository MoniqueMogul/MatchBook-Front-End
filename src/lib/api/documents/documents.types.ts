/* Backend contracts and frontend view models for Documents. */

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

export type ApiDocumentType =
  | "bank_statement"
  | "tax_return"
  | "profit_and_loss"
  | "balance_sheet"
  | "proof_of_funds"
  | "loan_approval"
  | "business_license"
  | "other";

export type ApiVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "uploading"
  | "uploaded"
  | "processing"
  | "requires_review"
  | "failed";

export interface ApiDocumentUploadRequest {
  expected_document_type: ApiDocumentType;
  original_filename: string;
  mime_type: "application/pdf";
  file_size: number;
  buyer_financials_id: string;
  declaration_signed?: boolean;
}

export interface BusinessDocumentUploadRequest {
  expected_document_type: ApiDocumentType;
  original_filename: string;
  mime_type: string;
  file_size: number;
  declaration_signed?: boolean;
}

export interface ApiDocumentUploadResponse {
  document_id: string;
  upload_url: string;
  required_headers: Record<string, string>;
  expires_in_seconds: number;
}

export interface ApiDocumentResponse {
  id: string;
  document_type: ApiDocumentType;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  verification_status: ApiVerificationStatus;
  verification_provider: string | null;
  verified_at: string | null;
  document_metadata: Record<string, unknown> | null;
  uploaded_at: string;
}

export interface DocumentDownloadResponse {
  download_url: string;
  expires_in_seconds: number;
}

export interface BuyerFinancialsReference {
  id: string;
}

export interface DocumentUploadInput {
  file: File;
  documentType: ApiDocumentType;
  displayType: string;
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
  {
    key: "tax-returns",
    label: "Tax Returns (2 Years)",
    documentType: "tax_return",
  },
  {
    key: "bank-statements",
    label: "Bank Statements",
    documentType: "bank_statement",
  },
  {
    key: "401k-statement",
    label: "401K Statement",
    documentType: "proof_of_funds",
  },
  {
    key: "lender-pre-approval",
    label: "Lender Pre-Approval Letter",
    documentType: "loan_approval",
  },
  {
    key: "bank-pre-approval",
    label: "Bank Pre-Approval Letter",
    documentType: "loan_approval",
  },
] as const;
