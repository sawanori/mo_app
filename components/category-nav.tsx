"use client";

import { Button } from "@/components/ui/button";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryNav({ categories, selectedCategory, onSelectCategory }: CategoryNavProps) {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const colorScheme = COLOR_THEMES[currentTheme];

  return (
    <div className="w-full rounded-md border p-1.5">
      <div className="flex gap-1 justify-center">
        <Button
          variant={selectedCategory === "すべて" ? "default" : "secondary"}
          className="flex-shrink-0 text-[10px] h-7 px-2"
          style={{
            backgroundColor: selectedCategory === "すべて" ? colorScheme.mainCategoryButtonBg : undefined,
          }}
          onClick={() => onSelectCategory("すべて")}
        >
          すべて
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className="flex-shrink-0 text-[10px] h-7 px-2"
            style={{
              backgroundColor: selectedCategory === category ? colorScheme.mainCategoryButtonBg : undefined,
            }}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}