"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeaturedType = "monthly" | "limited" | "new";

interface FeaturedStore {
  featuredItems: Record<FeaturedType, string | null>;
  setFeaturedItem: (type: FeaturedType, itemId: string | null) => void;
}

export const useFeaturedStore = create<FeaturedStore>()(
  persist(
    (set) => ({
      featuredItems: {
        monthly: null,
        limited: null,
        new: null,
      },
      setFeaturedItem: (type, itemId) =>
        set((state) => ({
          featuredItems: {
            ...state.featuredItems,
            [type]: itemId,
          },
        })),
    }),
    {
      name: 'featured-storage',
    }
  )
);