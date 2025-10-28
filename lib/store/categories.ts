import { create } from 'zustand';

export interface SubCategory {
  id: number;
  name: string;
  displayType?: "text" | "image"; // 表示タイプ（テキストのみ or 背景画像付き）
  backgroundImage?: string; // 背景画像URL（オプショナル）
  sortOrder: number; // 表示順序
  mainCategoryId?: number; // For API compatibility
}

export interface MainCategory {
  id: number;
  name: string;
  subCategories: SubCategory[];
  sortOrder: number; // 表示順序
}

interface CategoryStore {
  mainCategories: MainCategory[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addMainCategory: (name: string) => Promise<void>;
  addSubCategory: (mainCategoryId: number, subCategoryName: string, displayType?: "text" | "image", backgroundImage?: string) => Promise<void>;
  updateMainCategory: (id: number, name: string) => Promise<void>;
  updateSubCategory: (mainCategoryId: number, subCategoryId: number, newName: string, displayType?: "text" | "image", backgroundImage?: string) => Promise<void>;
  deleteMainCategory: (id: number) => Promise<void>;
  deleteSubCategory: (mainCategoryId: number, subCategoryId: number) => Promise<void>;
  reorderSubCategories: (mainCategoryId: number, reorderedSubCategories: SubCategory[]) => Promise<void>;
  reorderMainCategories: (reorderedMainCategories: MainCategory[]) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  mainCategories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const categories = await response.json();
      set({ mainCategories: categories, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addMainCategory: async (name) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const maxSortOrder = state.mainCategories.length > 0
        ? Math.max(...state.mainCategories.map(c => c.sortOrder))
        : -1;

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'main',
          name,
          sortOrder: maxSortOrder + 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to add main category');
      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addSubCategory: async (mainCategoryId, subCategoryName, displayType = "text", backgroundImage) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const mainCategory = state.mainCategories.find(c => c.id === mainCategoryId);
      const maxSortOrder = mainCategory && mainCategory.subCategories.length > 0
        ? Math.max(...mainCategory.subCategories.map(s => s.sortOrder))
        : -1;

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sub',
          name: subCategoryName,
          displayType,
          backgroundImage,
          mainCategoryId,
          sortOrder: maxSortOrder + 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to add subcategory');
      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateMainCategory: async (id, name) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'main',
          id,
          name,
        }),
      });

      if (!response.ok) throw new Error('Failed to update main category');
      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateSubCategory: async (mainCategoryId, subCategoryId, newName, displayType, backgroundImage) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sub',
          id: subCategoryId,
          name: newName,
          ...(displayType !== undefined && { displayType }),
          ...(backgroundImage !== undefined && { backgroundImage }),
        }),
      });

      if (!response.ok) throw new Error('Failed to update subcategory');
      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteMainCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/categories?type=main&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete main category');
      set((state) => ({
        mainCategories: state.mainCategories.filter((category) => category.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteSubCategory: async (mainCategoryId, subCategoryId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/categories?type=sub&id=${subCategoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subcategory');
      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  reorderSubCategories: async (mainCategoryId, reorderedSubCategories) => {
    set({ loading: true, error: null });
    try {
      // Update sortOrder for reordered subcategories
      const updatedSubCategories = reorderedSubCategories.map((sub, index) => ({
        ...sub,
        sortOrder: index,
      }));

      // Update each subcategory in the database
      await Promise.all(
        updatedSubCategories.map((sub) =>
          fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'sub',
              id: sub.id,
              sortOrder: sub.sortOrder,
            }),
          })
        )
      );

      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  reorderMainCategories: async (reorderedMainCategories) => {
    set({ loading: true, error: null });
    try {
      // Update sortOrder for reordered main categories
      const updatedMainCategories = reorderedMainCategories.map((mainCat, index) => ({
        ...mainCat,
        sortOrder: index,
      }));

      // Update each main category in the database
      await Promise.all(
        updatedMainCategories.map((mainCat) =>
          fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'main',
              id: mainCat.id,
              sortOrder: mainCat.sortOrder,
            }),
          })
        )
      );

      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));