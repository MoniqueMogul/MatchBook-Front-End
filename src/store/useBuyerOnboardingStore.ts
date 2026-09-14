import { create } from 'zustand';

/* ------------------------------------------------------------------ */
/*  Data Contracts                                                     */
/* ------------------------------------------------------------------ */

export interface BuyerAboutYouData {
  fullName: string;
  country: string;
  state: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

export interface BuyerOnboardingState {
  currentStep: number;
  totalSteps: number;

  /* Step 1 */
  aboutYou: BuyerAboutYouData;

  /* Actions */
  setAboutYou: (data: Partial<BuyerAboutYouData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_ABOUT_YOU: BuyerAboutYouData = {
  fullName: '',
  country: 'United States',
  state: '',
  phoneCountryCode: '+1',
  phoneNumber: '',
};

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useBuyerOnboardingStore = create<BuyerOnboardingState>((set) => ({
  currentStep: 1,
  totalSteps: 10,

  aboutYou: { ...DEFAULT_ABOUT_YOU },

  setAboutYou: (data) =>
    set((state) => ({
      aboutYou: { ...state.aboutYou, ...data },
    })),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  resetOnboarding: () =>
    set({
      currentStep: 1,
      aboutYou: { ...DEFAULT_ABOUT_YOU },
    }),
}));
