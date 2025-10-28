"use client";

import { useState, useRef, useEffect } from "react";
import { SubCategoryNav } from "@/components/sub-category-nav";
import { MenuSection } from "@/components/menu-section";
import { useCategoryStore, SubCategory } from "@/lib/store/categories";
import { useStickySidebar } from "@/hooks/use-sticky-sidebar";
import { useSubcategoryScroll } from "@/hooks/use-subcategory-scroll";

interface MenuWrapperProps {
  selectedMainCategory: string;
}

export function MenuWrapper({ selectedMainCategory }: MenuWrapperProps) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const sidebarTopRef = useRef<HTMLDivElement>(null);
  const { isSticky } = useStickySidebar(sidebarTopRef);
  const mainCategories = useCategoryStore((state) => state.mainCategories);
  const subCategoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const subCategoryTitleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const menuContentRef = useRef<HTMLDivElement>(null);
  const subCategoryContainerRef = useRef<HTMLDivElement>(null);
  const { scrollToSubCategory } = useSubcategoryScroll(
    subCategoryRefs,
    subCategoryContainerRef,
    subCategoryTitleRefs
  );

  // Get all sub-categories or filtered ones
  const getAllSubCategories = (): SubCategory[] => {
    if (selectedMainCategory === "すべて") {
      // Flatten all sub-categories from all main categories
      const allSubs: SubCategory[] = [];
      mainCategories.forEach((cat) => {
        allSubs.push(...cat.subCategories);
      });
      return allSubs;
    }
    const currentMainCategory = mainCategories.find(cat => cat.name === selectedMainCategory);
    return currentMainCategory?.subCategories || [];
  };

  const subCategories = getAllSubCategories();

  // Reset selectedSubCategory when main category changes
  useEffect(() => {
    setSelectedSubCategory(null);
  }, [selectedMainCategory]);

  // Sticky behavior handled by useStickySidebar

  const handleSubCategoryClick = (subCategoryName: string) => {
    setSelectedSubCategory(subCategoryName);
    scrollToSubCategory(subCategoryName);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Layout: 2-column (left sidebar + content) - 1:4 ratio */}
      <div className="flex gap-2 landscape:gap-4 flex-1 min-h-0">
        {/* Left Sidebar - Sub Categories (20% width) */}
        <aside
          ref={sidebarTopRef}
          className="w-[20%] flex-shrink-0 pr-1"
          data-testid="sidebar-subcategories"
        >
          <div
            ref={subCategoryContainerRef}
            className={`overflow-y-auto transition-all duration-300 ${
              isSticky ? 'sticky top-0 max-h-screen' : ''
            }`}
          >
            <SubCategoryNav
              subCategories={subCategories}
              selectedSubCategory={selectedSubCategory}
              onSelectSubCategory={handleSubCategoryClick}
              subCategoryRefs={subCategoryRefs}
            />
          </div>
        </aside>

        {/* Right Content - Menu Items (80% width) */}
        <main
          ref={menuContentRef}
          className="w-[80%] flex-shrink-0 overflow-y-auto pr-1"
          data-testid="menu-content"
        >
          <MenuSection
            selectedMainCategory={selectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            subCategoryTitleRefs={subCategoryTitleRefs}
          />
        </main>
      </div>
    </div>
  );
}
