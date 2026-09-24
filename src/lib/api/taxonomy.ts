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
  const response =
    await api.get<IndustryOption[]>("/intake/industries");

  return response.data;
}

export async function getBusinessModelOptions(): Promise<
  BusinessModelOption[]
> {
  const response =
    await api.get<BusinessModelOption[]>(
      "/intake/business-models",
    );

  return response.data;
}
