import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BuyerProfileSection =
  | "overview"
  | "experience"
  | "acquisition"
  | "finances"
  | "verification";

export interface BuyerOnboardingState {
  currentStep: number;
  totalSteps: number;

  /**
   * true  = user has not finished buyer onboarding
   * false = onboarding is complete
   */
  onboardingInProgress: boolean;

  completedSections: Record<BuyerProfileSection, boolean>;

  nextStep: () => void;
  prevStep: () => void;

  markSectionCompleted: (
    section: BuyerProfileSection
  ) => void;

  completeOnboarding: () => void;

  resetOnboarding: () => void;
}

const DEFAULT_COMPLETED_SECTIONS: Record<
  BuyerProfileSection,
  boolean
> = {
  overview: false,
  experience: false,
  acquisition: false,
  finances: false,
  verification: false,
};

export const useBuyerOnboardingStore =
  create<BuyerOnboardingState>()(
    persist(
      (set) => ({
        currentStep: 1,

        totalSteps: 10,

        onboardingInProgress: true,

        completedSections: {
          ...DEFAULT_COMPLETED_SECTIONS,
        },

        nextStep: () =>
          set((state) => ({
            currentStep: Math.min(
              state.currentStep + 1,
              state.totalSteps
            ),
          })),

        prevStep: () =>
          set((state) => ({
            currentStep: Math.max(
              state.currentStep - 1,
              1
            ),
          })),

        markSectionCompleted: (section) =>
          set((state) => ({
            completedSections: {
              ...state.completedSections,
              [section]: true,
            },
          })),

        completeOnboarding: () =>
          set({
            onboardingInProgress: false,
          }),

        resetOnboarding: () =>
          set({
            currentStep: 1,

            totalSteps: 10,

            onboardingInProgress: true,

            completedSections: {
              ...DEFAULT_COMPLETED_SECTIONS,
            },
          }),
      }),
      {
        name: "matchbook:buyer-onboarding",

        // Version the persisted store so old `aboutYou`
        // data can be migrated away cleanly.
        version: 2,

        migrate: (persistedState) => {
          if (!persistedState) {
            return persistedState;
          }

          const state =
            persistedState as Partial<BuyerOnboardingState>;

          return {
            currentStep:
              state.currentStep ?? 1,

            totalSteps:
              state.totalSteps ?? 10,

            onboardingInProgress:
              state.onboardingInProgress ?? true,

            completedSections:
              state.completedSections ??
              DEFAULT_COMPLETED_SECTIONS,
          };
        },
      }
    )
  );