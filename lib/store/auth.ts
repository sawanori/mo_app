"use client";

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAdminRole: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,

  initialize: async () => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        set({ user, isAuthenticated: true });
        await get().checkAdminRole();
      } else {
        set({ user: null, isAuthenticated: false, isAdmin: false });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        isAuthenticated: true,
        loading: false
      });

      await get().checkAdminRole();
      return true;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
        isAuthenticated: false,
        isAdmin: false
      });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkAdminRole: async () => {
    const { user } = get();
    if (!user) {
      set({ isAdmin: false });
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      set({ isAdmin: data?.role === 'admin' });
    } catch (error) {
      console.error('Error checking admin role:', error);
      set({ isAdmin: false });
    }
  },
}));