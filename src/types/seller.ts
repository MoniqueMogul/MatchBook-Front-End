export type BusinessStatus = "active" | "draft";

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
  asking_price?: number;
  annual_revenue_min?: number;
  annual_revenue_max?: number;
  annual_profit?: number;
}