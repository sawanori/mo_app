"use client";

import { create } from 'zustand';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  subCategory: string;
  cardSize?: "normal" | "large"; // カードサイズ（通常 or 大）
  mediaType?: "image" | "video"; // メディアタイプ（画像 or 動画）
  sortOrder: number; // 表示順序
}

interface MenuStore {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<MenuItem, "id" | "sortOrder">) => Promise<void>;
  updateItem: (id: number, item: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  reorderItems: (category: string, subCategory: string, reorderedItems: MenuItem[]) => Promise<void>;
}

export const useMenuStore = create<MenuStore>()((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/menu-items');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const items = await response.json();
      set({ items, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addItem: async (item) => {
    set({ loading: true, error: null });
    try {
      // Calculate sortOrder for the new item
      const state = get();
      const categoryItems = state.items.filter(
        i => i.category === item.category && i.subCategory === item.subCategory
      );
      const maxSortOrder = categoryItems.length > 0
        ? Math.max(...categoryItems.map(i => i.sortOrder))
        : -1;

      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          sortOrder: maxSortOrder + 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to add menu item');
      const newItem = await response.json();
      set((state) => ({
        items: [...state.items, newItem],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateItem: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/menu-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) throw new Error('Failed to update menu item');
      const updatedItem = await response.json();
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedItem : item
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/menu-items?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete menu item');
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  reorderItems: async (category, subCategory, reorderedItems) => {
    set({ loading: true, error: null });
    try {
      // Update sortOrder for reordered items
      const updatedReorderedItems = reorderedItems.map((item, index) => ({
        ...item,
        sortOrder: index
      }));

      // Update each item in the database
      await Promise.all(
        updatedReorderedItems.map((item) =>
          fetch('/api/menu-items', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, sortOrder: item.sortOrder }),
          })
        )
      );

      // Replace items in the state with reordered items
      set((state) => {
        const otherItems = state.items.filter(
          item => !(item.category === category && item.subCategory === subCategory)
        );
        return {
          items: [...otherItems, ...updatedReorderedItems],
          loading: false,
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));