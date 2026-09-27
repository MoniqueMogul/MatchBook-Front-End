import { useBuyerOnboardingStore } from "@/store/useBuyerOnboardingStore";

export const BUYER_ONBOARDING_PROFILE_PATH =
  "/buyer-onboarding/profile";

export const BUYER_PROFILE_PREVIEW_PATH =
  "/buyer/profile";

export function getBuyerProfilePath(): string {
  const {
    onboardingInProgress,
  } = useBuyerOnboardingStore.getState();

  return onboardingInProgress
    ? BUYER_ONBOARDING_PROFILE_PATH
    : BUYER_PROFILE_PREVIEW_PATH;
}