import { create } from 'zustand';

interface AuthState {
  email: string;
  role: 'buyer' | 'seller' | null;
  setEmail: (email: string) => void;
  setRole: (role: 'buyer' | 'seller') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: '',
  role: null,
  setEmail: (email) => set({ email }),
  setRole: (role) => set({ role }),
}));