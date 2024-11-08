"use client";

import { useState } from "react";
import { CategoryNav } from "@/components/category-nav";
import { MenuSection } from "@/components/menu-section";
import { useCategoryStore } from "@/lib/store/categories";

export function MenuWrapper() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const categories = useCategoryStore((state) => 
    state.categories.map(category => category.name)
  );

  return (
    <>
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <MenuSection selectedCategory={selectedCategory} />
    </>
  );
}