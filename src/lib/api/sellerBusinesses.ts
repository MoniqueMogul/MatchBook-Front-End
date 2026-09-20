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
    industry_name: "Food & Beverage",
    description: "Small-batch roastery serving local cafes and direct consumers.",
    city: "Portland",
    state: "Oregon",
    status: "active",
    completion_percent: 100,
  },
  {
    id: "biz_002",
    name: "Boutique Fitness Studio",
    industry_name: "Health & Wellness",
    description: "Boutique fitness studio with loyal membership base.",
    city: "Austin",
    state: "Texas",
    status: "active",
    completion_percent: 100,
  },
  {
    id: "biz_003",
    name: "Laundromat Chain",
    industry_name: "Home & Professional Services",
    description: "Three-location laundromat operation in the metro area.",
    city: "Seattle",
    state: "Washington",
    status: "draft",
    completion_percent: 65,
  },
  {
    id: "biz_004",
    name: "Craft Brewery",
    industry_name: "Food & Beverage",
    description: "Regional craft brewery with taproom and distribution.",
    city: "Denver",
    state: "Colorado",
    status: "draft",
    completion_percent: 45,
  },
];

/* =====================================================
   API calls
   ===================================================== */

export async function getSellerBusinesses(): Promise<Business[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_BUSINESSES), 400));
  }
  const res = await api.get<Business[]>("/intake/sellers/businesses");
  return res.data;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_BUSINESSES.find((b) => b.id === id) ?? null), 300)
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

export async function deleteBusiness(id: string, _password: string): Promise<void> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  // TODO: confirm delete endpoint shape with backend
  await api.post(`/intake/sellers/businesses/${id}/delete`, { password: _password });
}