"use client";

import { MenuItem } from "@/lib/store/menu";
import { MenuItemCard } from "./menu-item-card";

interface MenuGridProps {
  items: MenuItem[];
  isOrdered: (id: number) => boolean;
  onSelect: (item: MenuItem) => void;
}

export function MenuGrid({ items, isOrdered, onSelect }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3" data-testid="menu-grid">
      {items.map((item, index) => (
        <MenuItemCard
          key={item.id}
          item={item}
          isFirst={index === 0}
          isOrdered={isOrdered(item.id)}
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  );
}

