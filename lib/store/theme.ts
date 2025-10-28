"use client";

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export type ColorTheme = "part1" | "part2";

export interface ColorScheme {
  background: string;
  mainText: string;
  navigationText: string;
  subCategoryButtonBg: string;
  mainCategoryButtonBg: string;
  headerBg: string;
  headerIcon: string;
  heroCarouselArrow: string;
  footerBg: string;
}

export const COLOR_THEMES: Record<ColorTheme, ColorScheme> = {
  part1: {
    background: "#ffffff",
    mainText: "#1c1c1c",
    navigationText: "#a1a1a1",
    subCategoryButtonBg: "#ffffff",
    mainCategoryButtonBg: "#ffffff",
    headerBg: "#ffffff",
    headerIcon: "#1c1c1c",
    heroCarouselArrow: "#1c1c1c",
    footerBg: "#ffffff",
  },
  part2: {
    background: "#696363",
    mainText: "#ffffff",
    navigationText: "#aba6a6",
    subCategoryButtonBg: "#696363",
    mainCategoryButtonBg: "#ffba0a",
    headerBg: "#696363",
    headerIcon: "#ffffff",
    heroCarouselArrow: "#aba6a6",
    footerBg: "#696363",
  },
};

interface ThemeStore {
  currentTheme: ColorTheme;
  loading: boolean;
  error: string | null;
  fetchTheme: () => Promise<void>;
  setTheme: (theme: ColorTheme) => Promise<void>;
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  currentTheme: "part1",
  loading: false,
  error: null,

  fetchTheme: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'color_theme')
        .single();

      if (error) {
        // If no theme is set yet, use default
        if (error.code === 'PGRST116') {
          console.log('[Theme] No theme setting found, using default "part1"');
          set({ currentTheme: "part1", loading: false });
          return;
        }
        throw error;
      }

      const theme = data?.value as ColorTheme;
      console.log('[Theme] Fetched theme:', theme);
      set({ currentTheme: theme || "part1", loading: false });
    } catch (error) {
      console.error('[Theme] Error fetching theme:', error);
      // On error, use default theme instead of failing
      set({ currentTheme: "part1", error: null, loading: false });
    }
  },

  setTheme: async (theme: ColorTheme) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      // Upsert theme setting
      const { error } = await supabase
        .from('settings')
        .upsert(
          { key: 'color_theme', value: theme },
          { onConflict: 'key' }
        );

      if (error) throw error;

      console.log('[Theme] Updated theme to:', theme);
      set({ currentTheme: theme, loading: false });
    } catch (error) {
      console.error('[Theme] Error updating theme:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
