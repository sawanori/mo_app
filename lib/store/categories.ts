import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

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
      const supabase = createClient();

      // Fetch main categories
      const { data: mainCategoriesData, error: mainError } = await supabase
        .from('main_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (mainError) throw mainError;

      // Fetch sub categories
      const { data: subCategoriesData, error: subError } = await supabase
        .from('sub_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (subError) throw subError;

      // Convert snake_case to camelCase and structure the data
      const categories: MainCategory[] = (mainCategoriesData || []).map(mainCat => ({
        id: mainCat.id,
        name: mainCat.name,
        sortOrder: mainCat.sort_order || 0,
        subCategories: (subCategoriesData || [])
          .filter(sub => sub.main_category_id === mainCat.id)
          .map(sub => ({
            id: sub.id,
            name: sub.name,
            displayType: sub.display_type as "text" | "image" | undefined,
            backgroundImage: sub.background_image,
            sortOrder: sub.sort_order || 0,
            mainCategoryId: sub.main_category_id,
          })),
      }));

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

      const supabase = createClient();
      const { error } = await supabase
        .from('main_categories')
        .insert({
          name,
          sort_order: maxSortOrder + 1,
        });

      if (error) throw error;

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

      const supabase = createClient();
      const { error } = await supabase
        .from('sub_categories')
        .insert({
          name: subCategoryName,
          display_type: displayType,
          background_image: backgroundImage,
          main_category_id: mainCategoryId,
          sort_order: maxSortOrder + 1,
        });

      if (error) throw error;

      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateMainCategory: async (id, name) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('main_categories')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateSubCategory: async (mainCategoryId, subCategoryId, newName, displayType, backgroundImage) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      // Build update object with snake_case field names
      const updates: any = { name: newName };
      if (displayType !== undefined) updates.display_type = displayType;
      if (backgroundImage !== undefined) updates.background_image = backgroundImage;

      const { error } = await supabase
        .from('sub_categories')
        .update(updates)
        .eq('id', subCategoryId);

      if (error) throw error;

      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteMainCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('main_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
      const supabase = createClient();
      const { error } = await supabase
        .from('sub_categories')
        .delete()
        .eq('id', subCategoryId);

      if (error) throw error;

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

      const supabase = createClient();

      // Update each subcategory in the database
      await Promise.all(
        updatedSubCategories.map((sub) =>
          supabase
            .from('sub_categories')
            .update({ sort_order: sub.sortOrder })
            .eq('id', sub.id)
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

      const supabase = createClient();

      // Update each main category in the database
      await Promise.all(
        updatedMainCategories.map((mainCat) =>
          supabase
            .from('main_categories')
            .update({ sort_order: mainCat.sortOrder })
            .eq('id', mainCat.id)
        )
      );

      await get().fetchCategories(); // Refresh categories
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));