"use client";

import { useState, useRef, useEffect } from "react";
import { SubCategoryNav } from "@/components/sub-category-nav";
import { MenuSection } from "@/components/menu-section";
import { useCategoryStore, SubCategory } from "@/lib/store/categories";

interface MenuWrapperProps {
  selectedMainCategory: string;
}

export function MenuWrapper({ selectedMainCategory }: MenuWrapperProps) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const mainCategories = useCategoryStore((state) => state.mainCategories);
  const subCategoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const subCategoryTitleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const menuContentRef = useRef<HTMLDivElement>(null);
  const subCategoryContainerRef = useRef<HTMLDivElement>(null);
  const sidebarTopRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const stickyStartPositionRef = useRef(0);

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

  // Monitor scroll to apply/remove sticky positioning
  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarTopRef.current) return;

      const rect = sidebarTopRef.current.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollYRef.current;

      // Case 1: サイドバーが画面上部に到達 & 現在sticky状態ではない
      if (rect.top <= 0 && !isSticky) {
        setIsSticky(true);
        stickyStartPositionRef.current = currentScrollY;
      }

      // Case 2: sticky状態で下にスクロール & 固定開始位置から300px以上進んだ
      else if (isSticky && scrollingDown && (currentScrollY - stickyStartPositionRef.current) > 300) {
        setIsSticky(false);
      }

      // Case 3: sticky状態で上にスクロール & サイドバーの元の位置が見えている
      else if (isSticky && !scrollingDown && rect.top > 0) {
        setIsSticky(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky]);

  const handleSubCategoryClick = (subCategoryName: string) => {
    // Update state
    setSelectedSubCategory(subCategoryName);

    // Scroll to the subcategory title banner in the menu content area
    setTimeout(() => {
      const titleElement = subCategoryTitleRefs.current[subCategoryName];

      if (titleElement) {
        // Use scrollIntoView for reliable scrolling
        titleElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }

      // Also scroll sub-category button to center of sidebar
      const button = subCategoryRefs.current[subCategoryName];
      const sidebarContainer = subCategoryContainerRef.current;

      if (button && sidebarContainer) {
        const buttonTop = button.offsetTop;
        const buttonHeight = button.offsetHeight;
        const containerHeight = sidebarContainer.offsetHeight;

        // Calculate scroll position to center the button
        const scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2);

        sidebarContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Layout: 2-column (left sidebar + content) - 1:4 ratio */}
      <div className="flex gap-2 landscape:gap-4 flex-1 min-h-0">
        {/* Left Sidebar - Sub Categories (20% width) */}
        <aside
          ref={sidebarTopRef}
          className="w-[20%] flex-shrink-0 pr-1"
        >
          <div
            ref={subCategoryContainerRef}
            className={`overflow-y-auto transition-all duration-300 ${
              isSticky ? 'sticky top-[72px] max-h-[calc(100vh-72px)]' : ''
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
        <main ref={menuContentRef} className="w-[80%] flex-shrink-0 overflow-y-auto pr-1">
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