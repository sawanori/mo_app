"use client";

import { Button } from "@/components/ui/button";
import { SubCategory } from "@/lib/store/categories";
import { useRef } from "react";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";

interface SubCategoryNavProps {
  subCategories: SubCategory[];
  selectedSubCategory: string | null;
  onSelectSubCategory: (subCategory: string) => void;
  subCategoryRefs?: React.MutableRefObject<{ [key: string]: HTMLButtonElement | null }>;
}

export function SubCategoryNav({
  subCategories,
  selectedSubCategory,
  onSelectSubCategory,
  subCategoryRefs,
}: SubCategoryNavProps) {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const colorScheme = COLOR_THEMES[currentTheme];

  return (
    <div className="space-y-2">
      {subCategories.map((subCategory) => (
        <Button
          key={subCategory.id}
          ref={(el) => {
            if (subCategoryRefs && el) {
              subCategoryRefs.current[subCategory.name] = el;
            }
          }}
          variant={selectedSubCategory === subCategory.name ? "default" : "outline"}
          className="w-full justify-start text-[10px] h-auto py-2 px-2 whitespace-normal leading-tight"
          style={{
            backgroundColor: selectedSubCategory === subCategory.name ? colorScheme.subCategoryButtonBg : 'transparent',
          }}
          onClick={() => onSelectSubCategory(subCategory.name)}
        >
          {subCategory.name}
        </Button>
      ))}
    </div>
  );
}
