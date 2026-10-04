import { cachedRead, cachedWrite } from "@/store/apiCache";
import api from "./client";

export interface UserPersonal {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  profile_image_key: string | null;
}

export interface ProfileImageUploadUrlResponse {
  upload_url: string;
  object_key: string;
  required_headers: Record<string, string>;
  expires_in_seconds: number;
}

export interface ProfileImageResponse {
  url: string;
  expires_in_seconds: number;
}

export async function getCurrentUser(): Promise<UserPersonal> {
  return cachedRead("user", async () => {
    const response = await api.get<UserPersonal>("/intake/user");

    return response.data;
  });
}

export async function updateUserPhone(
  phone: string,
): Promise<UserPersonal> {
  return cachedWrite("user", async () => {
    try {
      const response = await api.put<UserPersonal>(
        "/intake/user/phone",
        {
          phone,
        },
      );

      return response.data;
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (error as {
          response?: {
            data?: {
              detail?: string;
            };
          };
        }).response;

        if (typeof response?.data?.detail === "string") {
          throw new Error(response.data.detail);
        }
      }

      throw error;
    }
  });
}

export async function getProfileImage(): Promise<ProfileImageResponse> {
  return cachedRead("profileImage", async () => {
    const response =
      await api.get<ProfileImageResponse>(
        "/intake/user/profile-image",
      );

    return response.data;
  }, value => Math.max(0, Math.min(60_000, (value.expires_in_seconds - 30) * 1000)));
}

export async function getProfileImageUploadUrl(
  contentType: "image/webp",
): Promise<ProfileImageUploadUrlResponse> {
  const response =
    await api.post<ProfileImageUploadUrlResponse>(
      "/intake/user/profile-image/upload-url",
      {
        content_type: contentType,
      },
    );

  return response.data;
}

export async function uploadProfileImage(
  uploadUrl: string,
  imageBlob: Blob,
  requiredHeaders: Record<string, string>,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: requiredHeaders,
    body: imageBlob,
  });

  if (!response.ok) {
    throw new Error(
      "Failed to upload profile image.",
    );
  }
}

export async function confirmProfileImage(
  objectKey: string,
): Promise<UserPersonal> {
  return cachedWrite("user", async () => {
    const response =
      await api.put<UserPersonal>(
        "/intake/user/profile-image",
        {
          object_key: objectKey,
        },
      );

    return response.data;
  }, ["profileImage"]);
}
