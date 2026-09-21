import api from "@/lib/api/client";
import type { Business } from "@/types/seller";

/* =====================================================
   MOCK DATA — replace with real API when backend is ready
   ===================================================== */
const USE_MOCK = true;

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
    customer_base: "Retail + Wholesale",
    work_schedule: "Owner-operated · ~35 hrs/week on roasting and fulfillment",
    revenue_trend: "Growing 12% YoY",
    premises_owned: true,
    reason_for_selling: "Retiring after 15 years",
    timeline: "Within 6 months",
    buyer_preference: "2–4 weeks handover",
    premises_type: "Long-Term Leasing",
    lease_term_remaining: "3 years",
    included_assets: ["Equipment", "Vehicles", "Inventory", "FF&E"],
    adjusted_ebitda: 375000,
    real_estate_value: 1000000,
    add_backs: 145000,
    bank_inventories: 175000,
    benchmark_delta: 34,
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
    acquisition_type: "Asset Sale",
    customer_base: "Membership",
    work_schedule: "Owner-operated · ~25 hrs/week",
    revenue_trend: "Stable",
    premises_owned: false,
    reason_for_selling: "Focusing on family",
    timeline: "Flexible",
    buyer_preference: "Open to operator",
    premises_type: "Leased",
    lease_term_remaining: "2 years",
    included_assets: ["Equipment", "FF&E"],
    adjusted_ebitda: 165000,
    real_estate_value: 0,
    add_backs: 45000,
    bank_inventories: 20000,
    benchmark_delta: 12,
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
    annual_revenue_min: 600000,
    annual_revenue_max: 700000,
    annual_profit: 260000,
    acquisition_type: "Asset Sale",
    customer_base: "Walk-in + Commercial",
    work_schedule: "Semi-absentee · ~15 hrs/week",
    revenue_trend: "Stable",
    premises_owned: false,
    reason_for_selling: "",
    timeline: "",
    buyer_preference: "",
    premises_type: "Long-Term Leasing",
    lease_term_remaining: "5 years",
    included_assets: ["Equipment", "Vehicles"],
    adjusted_ebitda: 320000,
    real_estate_value: 0,
    add_backs: 60000,
    bank_inventories: 25000,
    benchmark_delta: 8,
    year_established: "2012",
    legal_confirmed: false,
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
    annual_revenue_min: 900000,
    annual_revenue_max: 1100000,
    annual_profit: 180000,
    acquisition_type: "",
    customer_base: "",
    work_schedule: "",
    revenue_trend: "",
    premises_owned: false,
    reason_for_selling: "",
    timeline: "",
    buyer_preference: "",
    premises_type: "",
    lease_term_remaining: "",
    included_assets: [],
    adjusted_ebitda: 240000,
    real_estate_value: 0,
    add_backs: 60000,
    bank_inventories: 40000,
    benchmark_delta: -3,
    year_established: "2015",
    legal_confirmed: false,
  },
];

/* =====================================================
   API calls
   ===================================================== */

export async function getSellerBusinesses(): Promise<Business[]> {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_BUSINESSES), 400)
    );
  }
  const res = await api.get<Business[]>("/intake/sellers/businesses");
  return res.data;
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
  const res = await api.get<Business>(`/intake/sellers/businesses/${id}`);
  return res.data;
}

export async function publishBusiness(id: string): Promise<void> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  await api.patch(`/intake/sellers/businesses/${id}`, { status: "active" });
}

export async function unpublishBusiness(id: string): Promise<void> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  await api.patch(`/intake/sellers/businesses/${id}`, { status: "draft" });
}

export async function deleteBusiness(
  id: string,
  _password: string
): Promise<void> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  await api.post(`/intake/sellers/businesses/${id}/delete`, {
    password: _password,
  });
}