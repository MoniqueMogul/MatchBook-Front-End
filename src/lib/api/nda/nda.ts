import axios from "axios";

import api from "@/lib/api/client";

import type {
  NdaAccessResponse,
  NdaSigningSessionResponse,
} from "./nda.types";

export async function getNdaForMatch(
  matchId: string,
): Promise<NdaAccessResponse> {
  try {
    const response = await api.get<NdaAccessResponse>(
      `/nda/matches/${matchId}`,
    );

    return response.data;
  } catch (error) {
    throw createNdaError(
      error,
      "Unable to load the NDA for this match.",
    );
  }
}

export async function getOrInitializeNdaForMatch(
  matchId: string,
): Promise<NdaAccessResponse> {
  try {
    const response = await api.get<NdaAccessResponse>(
      `/nda/matches/${matchId}`,
    );

    return response.data;
  } catch (error) {
    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 404
    ) {
      throw createNdaError(
        error,
        "Unable to load the NDA for this match.",
      );
    }
  }

  try {
    const response = await api.post<NdaAccessResponse>(
      `/nda/matches/${matchId}`,
    );

    return response.data;
  } catch (error) {
    throw createNdaError(
      error,
      "Unable to initialize the NDA for this match.",
    );
  }
}

export async function createNdaSigningSession(
  ndaId: string,
): Promise<NdaSigningSessionResponse> {
  try {
    const response =
      await api.post<NdaSigningSessionResponse>(
        `/nda/${ndaId}/signing-session`,
      );

    return response.data;
  } catch (error) {
    throw createNdaError(
      error,
      "Unable to start the secure signing session.",
    );
  }
}

function createNdaError(
  error: unknown,
  fallback: string,
): Error {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    const detail = error.response?.data?.detail;

    if (detail) {
      return new Error(detail);
    }

    if (error.response?.status === 401) {
      return new Error(
        "Your session has expired. Please sign in again.",
      );
    }

    if (error.response?.status === 403) {
      return new Error(
        "You do not have access to this NDA.",
      );
    }

    if (error.response?.status === 404) {
      return new Error(
        "An NDA is not available for this match yet.",
      );
    }

    if (error.response?.status === 409) {
      return new Error(
        "This NDA cannot be signed in its current state.",
      );
    }

    if (error.response?.status === 503) {
      return new Error(
        "The electronic signature service is temporarily unavailable.",
      );
    }
  }

  return new Error(fallback);
}
