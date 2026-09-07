import { create } from 'zustand';

// ── Data contract for Step 1: "About You" ──
export interface BuyerAboutYouData {
  fullName: string;
  country: string;
  state: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

// ── Full buyer onboarding wizard state ──
export interface BuyerOnboardingState {
  currentStep: number;
  totalSteps: number;
  aboutYou: BuyerAboutYouData;
  setAboutYou: (data: Partial<BuyerAboutYouData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useBuyerOnboardingStore = create<BuyerOnboardingState>((set) => ({
  currentStep: 1,
  totalSteps: 10,

  aboutYou: {
    fullName: '',
    country: 'United States',
    state: '',
    phoneCountryCode: '+1',
    phoneNumber: '',
  },

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
}));
