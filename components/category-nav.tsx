"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryNav = memo(function CategoryNav({ categories, selectedCategory, onSelectCategory }: CategoryNavProps) {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const colorScheme = COLOR_THEMES[currentTheme];

  return (
    <div className="w-full rounded-md border p-1.5 overflow-hidden">
      <div className="flex gap-1 justify-center overflow-x-auto scrollbar-hide">
        <Button
          variant={selectedCategory === "すべて" ? "default" : "secondary"}
          className="flex-shrink-0 text-[10px] h-7 px-2 whitespace-nowrap"
          style={{
            backgroundColor: selectedCategory === "すべて" ? colorScheme.mainCategoryButtonBg : undefined,
          }}
          onClick={() => onSelectCategory("すべて")}
          data-testid="maincat-all"
        >
          すべて
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className="flex-shrink-0 text-[10px] h-7 px-2 whitespace-nowrap"
            style={{
              backgroundColor: selectedCategory === category ? colorScheme.mainCategoryButtonBg : undefined,
            }}
            onClick={() => onSelectCategory(category)}
            data-testid={`maincat-${category}`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
});
