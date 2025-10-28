"use client";

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Convert snake_case to camelCase
      const items: MenuItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        category: item.category,
        subCategory: item.sub_category,
        cardSize: item.card_size as "normal" | "large" | undefined,
        mediaType: item.media_type as "image" | "video" | undefined,
        sortOrder: item.sort_order || 0,
      }));

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

      const supabase = createClient();
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image,
          category: item.category,
          sub_category: item.subCategory,
          card_size: item.cardSize,
          media_type: item.mediaType,
          sort_order: maxSortOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: MenuItem = {
        id: data.id,
        name: data.name,
        price: data.price,
        description: data.description,
        image: data.image,
        category: data.category,
        subCategory: data.sub_category,
        cardSize: data.card_size as "normal" | "large" | undefined,
        mediaType: data.media_type as "image" | "video" | undefined,
        sortOrder: data.sort_order || 0,
      };

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
      const supabase = createClient();

      // Convert camelCase to snake_case for database fields
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subCategory !== undefined) dbUpdates.sub_category = updates.subCategory;
      if (updates.cardSize !== undefined) dbUpdates.card_size = updates.cardSize;
      if (updates.mediaType !== undefined) dbUpdates.media_type = updates.mediaType;
      if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

      const { data, error } = await supabase
        .from('menu_items')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedItem: MenuItem = {
        id: data.id,
        name: data.name,
        price: data.price,
        description: data.description,
        image: data.image,
        category: data.category,
        subCategory: data.sub_category,
        cardSize: data.card_size as "normal" | "large" | undefined,
        mediaType: data.media_type as "image" | "video" | undefined,
        sortOrder: data.sort_order || 0,
      };

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
      const supabase = createClient();
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

      const supabase = createClient();

      // Update each item in the database
      await Promise.all(
        updatedReorderedItems.map((item) =>
          supabase
            .from('menu_items')
            .update({ sort_order: item.sortOrder })
            .eq('id', item.id)
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