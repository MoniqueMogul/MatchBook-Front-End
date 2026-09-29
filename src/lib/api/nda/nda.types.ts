export type NdaStatus =
  | "pending"
  | "buyer_signed"
  | "seller_signed"
  | "completed"
  | "declined"
  | "expired";

export interface ApiNda {
  id: string;
  match_id: string;
  document_id: string;
  status: NdaStatus;
  version: string;
  buyer_signed_at: string | null;
  seller_signed_at: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface NdaAccessResponse {
  nda: ApiNda;
  current_user_has_signed: boolean;
  buyer_has_signed: boolean;
  seller_has_signed: boolean;
  completed: boolean;
}

export interface NdaSigningSessionResponse {
  signing_url: string;
}
