import { create } from "zustand";

export type BuyerProfileSection =
  | "overview"
  | "experience"
  | "acquisition"
  | "finances"
  | "verification";

export interface BuyerAboutYouData {
  countryCode: string;
  phone: string;
}

export interface BuyerOnboardingState {
  currentStep: number;
  totalSteps: number;

  aboutYou: BuyerAboutYouData;

  completedSections: Record<
    BuyerProfileSection,
    boolean
  >;

  setAboutYou: (
    data: Partial<BuyerAboutYouData>
  ) => void;

  nextStep: () => void;
  prevStep: () => void;

  markSectionCompleted: (
    section: BuyerProfileSection
  ) => void;

  resetOnboarding: () => void;
}

const DEFAULT_ABOUT_YOU: BuyerAboutYouData = {
  countryCode: "+91",
  phone: "",
};

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
  create<BuyerOnboardingState>((set) => ({
    currentStep: 1,
    totalSteps: 10,

    aboutYou: {
      ...DEFAULT_ABOUT_YOU,
    },

    completedSections: {
      ...DEFAULT_COMPLETED_SECTIONS,
    },

    setAboutYou: (data) =>
      set((state) => ({
        aboutYou: {
          ...state.aboutYou,
          ...data,
        },
      })),

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

    resetOnboarding: () =>
      set({
        currentStep: 1,
        totalSteps: 10,

        aboutYou: {
          ...DEFAULT_ABOUT_YOU,
        },

        completedSections: {
          ...DEFAULT_COMPLETED_SECTIONS,
        },
      }),
  }));