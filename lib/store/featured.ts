"use client";

import { create } from 'zustand';

export type FeaturedType = "slide1" | "slide2" | "slide3" | "slide4" | "slide5";

interface FeaturedStore {
  featuredItems: Record<FeaturedType, string | null>;
  loading: boolean;
  error: string | null;
  fetchFeaturedItems: () => Promise<void>;
  setFeaturedItem: (type: FeaturedType, itemId: string | null) => Promise<void>;
}

export const useFeaturedStore = create<FeaturedStore>()((set, get) => ({
  featuredItems: {
    slide1: null,
    slide2: null,
    slide3: null,
    slide4: null,
    slide5: null,
  },
  loading: false,
  error: null,

  fetchFeaturedItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/featured');
      if (!response.ok) throw new Error('Failed to fetch featured items');
      const featuredItems = await response.json();
      set({ featuredItems, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setFeaturedItem: async (type, itemId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, itemId }),
      });

      if (!response.ok) throw new Error('Failed to update featured item');

      set((state) => ({
        featuredItems: {
          ...state.featuredItems,
          [type]: itemId,
        },
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));