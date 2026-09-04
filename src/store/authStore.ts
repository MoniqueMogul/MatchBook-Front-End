import { create } from 'zustand';

interface AuthState {
  email: string;
  role: 'buyer' | 'seller' | null;
  step: number;
  setEmail: (email: string) => void;
  setRole: (role: 'buyer' | 'seller') => void;
  setStep: (step: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: '',
  role: null,
  step: 1,
  setEmail: (email) => set({ email }),
  setRole: (role) => set({ role }),
  setStep: (step) => set({ step }),
}));