"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (email: string, password: string) => {
        // モックの認証
        if (email === 'snp.inc.info@gmail.com' && password === '1234!') {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);