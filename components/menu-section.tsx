"use client";

import React, { useState, useEffect } from "react";
import { useOrderStore } from "@/lib/store/orders";
import { useMenuStore } from "@/lib/store/menu";
import { useCategoryStore } from "@/lib/store/categories";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProductModal } from "./product-modal";
import { MenuItem } from "@/lib/store/menu";
import { LoadingSpinner } from "./loading-spinner";

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
            {subCategory.displayType === "image" && subCategory.backgroundImage ? (
              // Background image style
              <div
                ref={(el) => {
                  if (subCategoryTitleRefs && el) {
                    subCategoryTitleRefs.current[subCategory.name] = el;
                  }
                }}
                className="mb-4 relative overflow-hidden h-16 rounded-lg"
              >
                <Image
                  src={subCategory.backgroundImage}
                  alt={subCategory.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                <div className="absolute inset-0 flex items-center gap-3 px-4">
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    {subCategory.name}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}品
                  </Badge>
                </div>
              </div>
            ) : (
              // Text only style
              <div
                ref={(el) => {
                  if (subCategoryTitleRefs && el) {
                    subCategoryTitleRefs.current[subCategory.name] = el;
                  }
                }}
                className="mb-4 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    {subCategory.name}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}品のメニュー
                  </Badge>
                </div>
              </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-2 gap-3">
              {items.map((item, index) => {
                const isFirstItem = index === 0;

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${
                      isFirstItem ? 'col-span-2' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex flex-col">
                      <div className="relative w-full aspect-square">
                        {item.mediaType === 'video' ? (
                          <video
                            src={item.image}
                            className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes={isFirstItem ? "100vw" : "(max-width: 768px) 50vw, 33vw"}
                          />
                        )}
                      </div>
                      <div className={`${isFirstItem ? 'p-3' : 'p-2'} space-y-1`}>
                        <h3 className={`font-semibold ${isFirstItem ? 'text-sm' : 'text-xs'} line-clamp-2`}>
                          {item.name}
                        </h3>
                        <p className={`${isFirstItem ? 'text-xs' : 'text-[10px]'} text-muted-foreground line-clamp-2`}>
                          {item.description}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="secondary" className={`${isFirstItem ? 'text-[10px]' : 'text-[9px]'} px-1 py-0`}>
                            {item.category}
                          </Badge>
                          {isOrdered(item.id) && (
                            <Badge variant="default" className={`${isFirstItem ? 'text-[10px]' : 'text-[9px]'} px-1 py-0`}>
                              注文済み
                            </Badge>
                          )}
                        </div>
                        <span className={`${isFirstItem ? 'text-base' : 'text-sm'} font-bold text-primary block`}>
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
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