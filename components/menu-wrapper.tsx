"use client";

import { useState, useRef, useEffect } from "react";
import { SubCategoryNav } from "@/components/sub-category-nav";
import { MenuSection } from "@/components/menu-section";
import { useCategoryStore, SubCategory } from "@/lib/store/categories";
import { useSubcategoryScroll } from "@/hooks/use-subcategory-scroll";
import { useStickySidebar } from "@/hooks/use-sticky-sidebar";

interface MenuWrapperProps {
  selectedMainCategory: string;
}

export function MenuWrapper({ selectedMainCategory }: MenuWrapperProps) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const { isFixed } = useStickySidebar(sidebarRef);
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

  const handleSubCategoryClick = (subCategoryName: string) => {
    setSelectedSubCategory(subCategoryName);
    scrollToSubCategory(subCategoryName);
  };

  return (
    <div className="flex gap-2 landscape:gap-4 px-3 items-start">
      {/* Left Sidebar Container */}
      <div className="w-[20%] flex-shrink-0">
        {/* Sidebar - Sub Categories */}
        <aside
          ref={sidebarRef}
          className={isFixed ? 'fixed top-0' : ''}
          style={isFixed ? { width: 'calc(20% - 12px)', left: '12px' } : undefined}
          data-testid="sidebar-subcategories"
        >
          <div
            ref={subCategoryContainerRef}
            className="max-h-screen overflow-y-auto"
          >
            <SubCategoryNav
              subCategories={subCategories}
              selectedSubCategory={selectedSubCategory}
              onSelectSubCategory={handleSubCategoryClick}
              subCategoryRefs={subCategoryRefs}
            />
          </div>
        </aside>
      </div>

      {/* Right Content - Menu Items (80% width) */}
      <main
        ref={menuContentRef}
        className="w-[80%] flex-shrink-0"
        data-testid="menu-content"
      >
        <MenuSection
          selectedMainCategory={selectedMainCategory}
          selectedSubCategory={selectedSubCategory}
          subCategoryTitleRefs={subCategoryTitleRefs}
        />
      </main>
    </div>
  );
}
