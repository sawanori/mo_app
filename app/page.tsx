"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { MenuWrapper } from "@/components/menu-wrapper";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { OrderConfirmation } from "@/components/order-confirmation";
import { CategoryNav } from "@/components/category-nav";
import { useCategoryStore } from "@/lib/store/categories";
import { useMenuStore } from "@/lib/store/menu";
import { useFeaturedStore } from "@/lib/store/featured";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";

export default function Home() {
  const [selectedMainCategory, setSelectedMainCategory] = useState("すべて");
  const mainCategories = useCategoryStore((state) => state.mainCategories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const fetchMenuItems = useMenuStore((state) => state.fetchItems);
  const fetchFeaturedItems = useFeaturedStore((state) => state.fetchFeaturedItems);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const fetchTheme = useThemeStore((state) => state.fetchTheme);
  const colorScheme = COLOR_THEMES[currentTheme];

  // Fetch data on mount
  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
    fetchFeaturedItems();
    fetchTheme();
  }, [fetchCategories, fetchMenuItems, fetchFeaturedItems, fetchTheme]);

  return (
    <div className="flex flex-col pb-20" style={{ backgroundColor: colorScheme.background, color: colorScheme.mainText }}>
      <Navigation />
      <div className="flex flex-col py-4 space-y-3 pt-[72px]">
        {/* Main Category Navigation */}
        <CategoryNav
          categories={mainCategories.map(cat => cat.name)}
          selectedCategory={selectedMainCategory}
          onSelectCategory={setSelectedMainCategory}
        />
        <h2 className="text-lg font-bold text-left px-3">当店のおすすめ</h2>
        <HeroSection />
        <MenuWrapper selectedMainCategory={selectedMainCategory} />
      </div>
      <OrderConfirmation />
      <Footer />
    </div>
  );
}