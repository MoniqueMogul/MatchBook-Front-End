export type BusinessStatus = "active" | "draft";

export interface BusinessFinancials {
  asking_price?: number;
  annual_revenue_min?: number;
  annual_revenue_max?: number;
  annual_profit?: number;
  adjusted_ebitda?: number;
  real_estate_value?: number;
  add_backs?: number;
  bank_inventories?: number;
}

export interface Business {
  id: string;
  name: string;
  industry_name: string;
  description: string;
  city: string;
  state: string;
  status: BusinessStatus;
  completion_percent: number;
  image_url?: string;
  hero_image_url?: string;

  // Financial summary
  asking_price?: number;
  annual_revenue_min?: number;
  annual_revenue_max?: number;
  annual_profit?: number;

  // Business Information tab
  acquisition_type?: string;
  customer_base?: string;
  work_schedule?: string;
  revenue_trend?: string;
  premises_owned?: boolean;

  // Sale Goals tab
  reason_for_selling?: string;
  timeline?: string;
  buyer_preference?: string;

  // Lease & Assets tab
  premises_type?: string;
  lease_term_remaining?: string;
  included_assets?: string[];

  // Finances tab
  adjusted_ebitda?: number;
  real_estate_value?: number;
  add_backs?: number;
  bank_inventories?: number;
  benchmark_delta?: number;

  // Legal tab
  year_established?: string;
  legal_confirmed?: boolean;
}