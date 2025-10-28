"use client";

import Image from "next/image";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface HeroCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
    mediaType?: "image" | "video";
  };
}

export const HeroCard = memo(function HeroCard({ item }: HeroCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-3xl" data-testid={`hero-card-${item.id}`}>
      <div className="relative aspect-square rounded-3xl">
        {item.mediaType === 'video' ? (
          <video
            src={item.image}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
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
            className="object-cover rounded-3xl"
            priority
          />
        )}
        <div className="absolute bottom-0 left-0 p-4 landscape:p-6 text-white">
          <h2 className="text-base landscape:text-lg font-bold mb-1 leading-tight drop-shadow-lg">
            {item.name}
          </h2>
          <span className="text-sm landscape:text-base font-bold drop-shadow-lg">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    </Card>
  );
});
