import axios from "axios";
import { supabase, getAccessToken } from "@/lib/supabase";

/**
 * Shared axios instance for all backend calls.
 * - Base URL: NEXT_PUBLIC_API_URL
 * - Request interceptor: attaches Authorization: Bearer <supabase access token>
 * - Response interceptor: on 401, refreshes the session once and retries
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data: refreshData } =
          await supabase.auth.refreshSession();

        let session = refreshData.session;

        /*
         * A backend request can race with Supabase immediately after OTP
         * verification. Re-read the auth client's current session before
         * treating the user as unauthenticated.
         */
        if (!session?.access_token) {
          const { data: sessionData } =
            await supabase.auth.getSession();

          session = sessionData.session;
        }

        if (!session?.access_token) {
          return Promise.reject(error);
        }

        originalRequest.headers =
          originalRequest.headers ?? {};
        originalRequest.headers.Authorization =
          `Bearer ${session.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;