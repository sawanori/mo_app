"use client";

import Image from "next/image";
import { memo } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MenuItem } from "@/lib/store/menu";
import { formatPrice } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  isFirst: boolean;
  isOrdered: boolean;
  onClick: () => void;
}

export const MenuItemCard = memo(function MenuItemCard({ item, isFirst, isOrdered, onClick }: MenuItemCardProps) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${
        isFirst ? "col-span-2" : ""
      }`}
      onClick={onClick}
      data-testid={`menu-item-${item.id}`}
      data-category={item.category}
      data-subcategory={item.subCategory}
    >
      <div className="flex flex-col">
        {item.image && item.image.trim() !== "" && (
          <div className="relative w-full aspect-square">
            {item.mediaType === "video" ? (
              <video
                src={item.image}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />)
              : (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes={isFirst ? "100vw" : "(max-width: 768px) 50vw, 33vw"}
              />
            )}
          </div>
        )}
        <div className={`${isFirst ? "p-3" : "p-2"} space-y-1`}>
          <h3 className={`font-semibold ${isFirst ? "text-sm" : "text-xs"} line-clamp-2`}>
            {item.name}
          </h3>
          <p className={`${isFirst ? "text-xs" : "text-[10px]"} text-muted-foreground line-clamp-2`}>
            {item.description}
          </p>
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className={`${isFirst ? "text-[10px]" : "text-[9px]"} px-1 py-0`}>
              {item.category}
            </Badge>
            {isOrdered && (
              <Badge variant="default" className={`${isFirst ? "text-[10px]" : "text-[9px]"} px-1 py-0`}>
                注文済み
              </Badge>
            )}
          </div>
          <span className={`${isFirst ? "text-base" : "text-sm"} font-bold text-primary block`}>
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    </Card>
  );
});
