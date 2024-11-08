import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: number;
  name: string;
}

interface CategoryStore {
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (id: number, name: string) => void;
  deleteCategory: (id: number) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: [
        { id: 1, name: "メイン料理" },
        { id: 2, name: "サイドメニュー" },
        { id: 3, name: "ドリンク" },
        { id: 4, name: "デザート" },
      ],
      addCategory: (name) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: Math.max(...state.categories.map(c => c.id), 0) + 1, name },
          ],
        })),
      updateCategory: (id, name) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, name } : category
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        })),
    }),
    {
      name: 'category-storage',
    }
  )
);