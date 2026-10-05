import { create } from "zustand";

export type AuthOtpPurpose =
  | "signup"
  | "signin"
  | null;

interface AuthState {
  email: string;
  userId: string | null;
  role: "buyer" | "seller" | null;
  step: number;
  otpPurpose: AuthOtpPurpose;

  setUser: (
    userId: string | null,
  ) => void;

  setEmail: (
    email: string,
  ) => void;

  setRole: (
    role:
      | "buyer"
      | "seller"
      | null,
  ) => void;

  setStep: (
    step: number,
  ) => void;

  setOtpPurpose: (
    purpose: AuthOtpPurpose,
  ) => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    email: "",
    userId: null,
    role: null,
    step: 1,
    otpPurpose: null,

    setUser: (userId) =>
      set((state) =>
        state.userId === userId
          ? state
          : {
              userId,
              role: null,
            },
      ),

    setEmail: (email) =>
      set({
        email,
      }),

    setRole: (role) =>
      set({
        role,
      }),

    setStep: (step) =>
      set({
        step,
      }),

    setOtpPurpose: (
      otpPurpose,
    ) =>
      set({
        otpPurpose,
      }),
  }));