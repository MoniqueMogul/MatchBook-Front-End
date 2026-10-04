import { create } from 'zustand';

interface AuthState {
  email: string;
  userId: string | null;
  setUser: (userId: string | null) => void;
  role: 'buyer' | 'seller' | null;
  step: number;
  setEmail: (email: string) => void;
  setRole: (role: 'buyer' | 'seller' | null) => void;
  setStep: (step: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: '',
  userId: null,
  setUser: (userId) => set(state => state.userId === userId ? state : { userId, role: null }),
  role: null,
  step: 1,
  setEmail: (email) => set({ email }),
  setRole: (role) => set({ role }),
  setStep: (step) => set({ step }),
}));