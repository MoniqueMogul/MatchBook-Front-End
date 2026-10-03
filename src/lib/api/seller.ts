import axios from "axios";
import api from "./client";
import { uploadProfileImage, type ProfileImageUploadUrlResponse, type ProfileImageResponse } from "./user";

// Contracts: backend app/intake/routes.py and schemas/business.py.
// SellerProfile is only the ownership link; personal data stays on User.
export interface SellerProfile { id: string; user_id: string }
export const BUSINESS_TYPES = ["sole_proprietorship", "partnership", "llc", "s_corporation", "c_corporation", "nonprofit", "other"] as const;

export interface BusinessFields {
  legal_name: string | null;
  dba: string | null;
  business_type: string;
  industry: string;
  sub_industry: string;
  business_model: string;
  city: string;
  state: string;
  county: string | null;
  zip_code: string | null;
  years_in_operation: number | null;
  number_of_locations: number | null;
  number_of_routes: number | null;
  arr: string | null;
  customer_concentration: string | null;
  asking_price: string | null;
  sde: string | null;
  owner_involvement_hours_per_week: number | null;
  transition_training_days: number | null;
  deal_preference: "cash" | "financing" | "either" | null;
  preferred_sale_timeline: string | null;
}
export interface SellerBusiness extends BusinessFields { id: string; status: string; profile_image_key?: string | null }

export function validateBusinessImage(file: File): void {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP business photo.");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("Business photos must be 10MB or smaller.");
}

export async function getBusinessImage(id: string): Promise<ProfileImageResponse> {
  return (await api.get<ProfileImageResponse>(`/intake/sellers/businesses/${encodeURIComponent(id)}/profile-image`)).data;
}

export async function saveBusinessImage(id: string, file: File): Promise<SellerBusiness> {
  validateBusinessImage(file);
  const endpoint = `/intake/sellers/businesses/${encodeURIComponent(id)}/profile-image`;
  const { data } = await api.post<ProfileImageUploadUrlResponse>(`${endpoint}/upload-url`, { content_type: file.type });
  // Signed storage requests must not carry the Supabase bearer token.
  await uploadProfileImage(data.upload_url, file, data.required_headers);
  return (await api.put<SellerBusiness>(endpoint, { object_key: data.object_key })).data;
}

export async function getSellerProfile(): Promise<SellerProfile> {
  return (await api.get<SellerProfile>("/intake/sellers/profile")).data;
}

export async function ensureSellerProfile(): Promise<void> {
  try { await getSellerProfile(); return; }
  catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
  }
  try { await api.post("/intake/sellers/profile", {}); }
  catch (error) {
    // Another tab may have created the same ownership record.
    if (!axios.isAxiosError(error) || error.response?.status !== 409) throw error;
    await getSellerProfile();
  }
}

export async function listSellerBusinesses(): Promise<SellerBusiness[]> {
  return (await api.get<SellerBusiness[]>("/intake/sellers/businesses")).data;
}
export async function getSellerBusiness(id: string): Promise<SellerBusiness> {
  return (await api.get<SellerBusiness>(`/intake/sellers/businesses/${encodeURIComponent(id)}`)).data;
}
export async function createSellerBusiness(fields: BusinessFields, key: string): Promise<SellerBusiness> {
  await ensureSellerProfile();
  return (await api.post<SellerBusiness>("/intake/sellers/businesses", fields, {
    headers: { "Idempotency-Key": key },
  })).data;
}
export async function updateSellerBusiness(id: string, fields: BusinessFields): Promise<SellerBusiness> {
  return (await api.put<SellerBusiness>(`/intake/sellers/businesses/${encodeURIComponent(id)}`, fields)).data;
}
export function sellerErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((item) => `${item.loc?.slice(1).join(".")}: ${item.msg}`).join("; ");
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
