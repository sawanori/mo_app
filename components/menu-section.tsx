"use client";

import React, { useState, useEffect } from "react";
import { useOrderStore } from "@/lib/store/orders";
import { useMenuStore } from "@/lib/store/menu";
import { useCategoryStore } from "@/lib/store/categories";
import { ProductModal } from "./product-modal";
import { MenuItem } from "@/lib/store/menu";
import { SubcategoryHeader } from "./subcategory-header";
import { MenuGrid } from "./menu-grid";

interface MenuSectionProps {
  selectedMainCategory: string;
  selectedSubCategory: string | null;
  subCategoryTitleRefs?: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

export function MenuSection({ selectedMainCategory, selectedSubCategory, subCategoryTitleRefs }: MenuSectionProps) {
  const orders = useOrderStore((state) => state.orders);
  const menuItems = useMenuStore((state) => state.items);
  const mainCategories = useCategoryStore((state) => state.mainCategories);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const isOrdered = (itemId: number) => {
    return orders.some(order =>
      order.items.some(item => Number(item.id) === itemId)
    );
  };

  // Get subcategories to display
  const subCategoriesToDisplay = (() => {
    if (selectedMainCategory === "すべて") {
      // Show all subcategories from all main categories
      const allSubs: Array<{ mainCategory: string; subCategory: any }> = [];
      mainCategories.forEach((mainCat) => {
        mainCat.subCategories.forEach((subCat) => {
          allSubs.push({ mainCategory: mainCat.name, subCategory: subCat });
        });
      });
      return allSubs;
    }

    // Show subcategories from selected main category
    const currentMainCategory = mainCategories.find(cat => cat.name === selectedMainCategory);
    if (!currentMainCategory) return [];

    return currentMainCategory.subCategories.map(subCat => ({
      mainCategory: selectedMainCategory,
      subCategory: subCat
    }));
  })();

  // Function to get items for a specific subcategory
  const getItemsForSubCategory = (mainCategoryName: string, subCategoryName: string) => {
    return menuItems.filter(
      item => item.category === mainCategoryName && item.subCategory === subCategoryName
    );
  };

  return (
    <>
      {/* Display each subcategory with its title banner and items */}
      {subCategoriesToDisplay.map(({ mainCategory, subCategory }) => {
        const items = getItemsForSubCategory(mainCategory, subCategory.name);

        // Skip if no items
        if (items.length === 0) return null;

        return (
          <div key={`${mainCategory}-${subCategory.id}`} className="mb-8">
            {/* Sub-category Title Banner */}
            <SubcategoryHeader
              name={subCategory.name}
              itemCount={items.length}
              displayType={subCategory.displayType}
              backgroundImage={subCategory.backgroundImage}
              registerRef={(el) => {
                if (subCategoryTitleRefs && el) {
                  subCategoryTitleRefs.current[subCategory.name] = el;
                }
              }}
            />

            {/* Items Grid */}
            <MenuGrid
              items={items}
              isOrdered={isOrdered}
              onSelect={(item) => setSelectedItem(item)}
            />
          </div>
        );
      })}

      {selectedItem && (
        <ProductModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
