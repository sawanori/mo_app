"use client";

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('featured_items')
        .select('*');

      if (error) throw error;

      // Convert database records to featuredItems object
      const featuredItems: Record<FeaturedType, string | null> = {
        slide1: null,
        slide2: null,
        slide3: null,
        slide4: null,
        slide5: null,
      };

      (data || []).forEach(item => {
        if (item.type && item.item_id) {
          featuredItems[item.type as FeaturedType] = item.item_id;
        }
      });

      set({ featuredItems, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setFeaturedItem: async (type, itemId) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      if (itemId === null) {
        // Delete the featured item if itemId is null
        const { error } = await supabase
          .from('featured_items')
          .delete()
          .eq('type', type);

        if (error) throw error;
      } else {
        // Upsert the featured item
        const { error } = await supabase
          .from('featured_items')
          .upsert({
            type,
            item_id: itemId,
          }, {
            onConflict: 'type'
          });

        if (error) throw error;
      }

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