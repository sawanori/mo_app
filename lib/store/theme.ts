"use client";

import { create } from 'zustand';

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
      const response = await fetch('/api/theme');
      if (!response.ok) throw new Error('Failed to fetch theme');
      const data = await response.json();
      set({ currentTheme: data.theme as ColorTheme, loading: false });
    } catch (error) {
      console.error('Error fetching theme:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  setTheme: async (theme: ColorTheme) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) throw new Error('Failed to update theme');

      set({ currentTheme: theme, loading: false });
    } catch (error) {
      console.error('Error updating theme:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
