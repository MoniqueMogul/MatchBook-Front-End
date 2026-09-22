import api from "@/lib/api/client";
import type { Business } from "@/types/seller";

/* =====================================================
   USE_MOCK flag
   - true  → returns mock data (dev, backend not ready)
   - false → hits the real backend
   ===================================================== */
const USE_MOCK = true;

/* =====================================================
   Mock data
   ===================================================== */
const MOCK_BUSINESSES: Business[] = [
  {
    id: "biz_001",
    name: "Specialty Coffee Roastery",
    industry_name: "Specialty Food & Beverage",
    description:
      "Small-batch roastery serving local cafes and direct consumers through a subscription model.",
    city: "Portland",
    state: "Oregon",
    status: "active",
    completion_percent: 100,
    asking_price: 750000,
    annual_revenue_min: 800000,
    annual_revenue_max: 900000,
    annual_profit: 200000,
    acquisition_type: "Asset Sale",
    work_schedule: "Owner-operated · ~35 hrs/week",
    timeline: "Within 6 months",
    adjusted_ebitda: 375000,
    year_established: "2010",
    legal_confirmed: true,
  },
  {
    id: "biz_002",
    name: "Boutique Fitness Studio",
    industry_name: "Health & Wellness",
    description:
      "Boutique fitness studio with a loyal membership base and established class schedule.",
    city: "Austin",
    state: "Texas",
    status: "active",
    completion_percent: 100,
    asking_price: 425000,
    annual_revenue_min: 400000,
    annual_revenue_max: 480000,
    annual_profit: 120000,
    year_established: "2016",
    legal_confirmed: true,
  },
  {
    id: "biz_003",
    name: "Laundromat Chain",
    industry_name: "Home & Professional Services",
    description:
      "Three-location laundromat operation in the metro area with stable cash flow.",
    city: "Seattle",
    state: "Washington",
    status: "draft",
    completion_percent: 65,
    asking_price: 890000,
    year_established: "2012",
  },
  {
    id: "biz_004",
    name: "Craft Brewery",
    industry_name: "Specialty Food & Beverage",
    description:
      "Regional craft brewery with a taproom and distribution in three states.",
    city: "Denver",
    state: "Colorado",
    status: "draft",
    completion_percent: 45,
    asking_price: 1250000,
  },
];

/* =====================================================
   Backend response shape (matches BusinessRead schema)
   ===================================================== */
interface ApiBusiness {
  id: string;
  seller_id: string;
  legal_name: string | null;
  dba: string | null;
  business_type: string;
  industry: string;
  city: string;
  county: string | null;
  state: string;
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
  deal_preference: string | null;
  preferred_sale_timeline: string | null;
  verification_status: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/* =====================================================
   Mappers
   ===================================================== */

function parseDecimal(value: string | null): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

function formatWorkSchedule(hours: number | null): string | undefined {
  if (hours === null || hours === undefined) return undefined;
  return `~${hours} hrs/week`;
}

function apiToUi(api: ApiBusiness): Business {
  const uiStatus: "active" | "draft" =
    api.status === "active" ? "active" : "draft";

  return {
    id: api.id,
    name: api.legal_name || api.dba || "Untitled Business",
    industry_name: api.industry,
    description: "",
    city: api.city,
    state: api.state,
    status: uiStatus,

    completion_percent: api.verification_status === "verified" ? 100 : 60,
    image_url: undefined,

    asking_price: parseDecimal(api.asking_price),
    annual_revenue_min: parseDecimal(api.arr),
    annual_revenue_max: parseDecimal(api.arr),
    annual_profit: undefined,
    adjusted_ebitda: parseDecimal(api.sde),

    acquisition_type: api.business_type,
    work_schedule: formatWorkSchedule(api.owner_involvement_hours_per_week),
    revenue_trend: undefined,
    premises_owned: undefined,

    reason_for_selling: undefined,
    timeline: api.preferred_sale_timeline ?? undefined,
    buyer_preference: undefined,

    premises_type: undefined,
    lease_term_remaining: undefined,
    included_assets: [],

    real_estate_value: undefined,
    add_backs: undefined,
    bank_inventories: undefined,
    benchmark_delta: undefined,

    year_established: api.years_in_operation?.toString(),
    legal_confirmed: api.verification_status === "verified",
  };
}

/* =====================================================
   API calls
   ===================================================== */

export async function getSellerBusinesses(): Promise<Business[]> {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_BUSINESSES), 400)
    );
  }

  const res = await api.get<ApiBusiness[]>("/intake/sellers/businesses");
  return res.data.map(apiToUi);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(MOCK_BUSINESSES.find((b) => b.id === id) ?? null),
        300
      )
    );
  }

  try {
    const res = await api.get<ApiBusiness>(`/intake/sellers/businesses/${id}`);
    return apiToUi(res.data);
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function publishBusiness(id: string): Promise<void> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  await api.patch(`/intake/sellers/businesses/${id}`, {
    status: "active",
  });
}

export async function unpublishBusiness(id: string): Promise<void> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  await api.patch(`/intake/sellers/businesses/${id}`, {
    status: "draft",
  });
}

export async function deleteBusiness(
  _id: string,
  _password: string
): Promise<void> {
  throw new Error(
    "Delete is not yet supported by the backend. Contact the backend team."
  );
}