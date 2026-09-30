import api from "./client";

export interface UserPersonal {
  phone: string | null;
}

export async function getCurrentUser(): Promise<UserPersonal> {
  const response = await api.get<UserPersonal>("/intake/user");

  return response.data;
}

export async function updateUserPhone(
  phone: string,
): Promise<UserPersonal> {
  const response = await api.put<UserPersonal>(
    "/intake/user/phone",
    {
      phone,
    },
  );

  return response.data;
}