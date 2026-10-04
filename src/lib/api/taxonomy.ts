import { cachedRead } from "@/store/apiCache";
import api from "./client";

export interface SubIndustryOption {
  value: string;
  label: string;
}

export interface IndustryOption {
  value: string;
  label: string;
  sub_industries: SubIndustryOption[];
}

export interface BusinessModelOption {
  value: string;
  label: string;
}

export async function getIndustryOptions(): Promise<IndustryOption[]> {
  return cachedRead("industries", async () => {
    const response =
      await api.get<IndustryOption[]>("/intake/industries");

    return response.data;
  }, 3_600_000);
}

export async function getBusinessModelOptions(): Promise<
  BusinessModelOption[]
> {
  return cachedRead("businessModels", async () => {
    const response =
      await api.get<BusinessModelOption[]>(
        "/intake/business-models",
      );

    return response.data;
  }, 3_600_000);
}
