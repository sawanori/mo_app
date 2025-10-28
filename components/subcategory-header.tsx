"use client";

import Image from "next/image";
import { memo } from "react";
import { Badge } from "./ui/badge";

interface SubcategoryHeaderProps {
  name: string;
  itemCount: number;
  displayType?: "text" | "image";
  backgroundImage?: string;
  registerRef?: (el: HTMLDivElement | null) => void;
}

export const SubcategoryHeader = memo(function SubcategoryHeader({
  name,
  itemCount,
  displayType,
  backgroundImage,
  registerRef,
}: SubcategoryHeaderProps) {
  const isImage = displayType === "image" && !!backgroundImage;

  if (isImage) {
    return (
      <div
        ref={registerRef}
        className="mb-4 relative overflow-hidden h-16 rounded-lg"
        data-testid={`subcategory-header-${name}`}
        data-name={name}
      >
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt={name}
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center gap-3 px-4">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {name}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {itemCount}品
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={registerRef}
      className="mb-4 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg p-4"
      data-testid={`subcategory-header-${name}`}
      data-name={name}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground">{name}</h2>
        <Badge variant="secondary" className="text-xs">
          {itemCount}品のメニュー
        </Badge>
      </div>
    </div>
  );
});
