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

export async function getProfileImage(): Promise<ProfileImageResponse> {
  const response =
    await api.get<ProfileImageResponse>(
      "/intake/user/profile-image",
    );

  return response.data;
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
  const response =
    await api.put<UserPersonal>(
      "/intake/user/profile-image",
      {
        object_key: objectKey,
      },
    );

  return response.data;
}