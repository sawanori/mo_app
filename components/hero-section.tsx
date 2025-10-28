"use client";

import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useToast } from "@/components/ui/use-toast";
import { useMenuStore } from "@/lib/store/menu";
import { useFeaturedStore } from "@/lib/store/featured";
import { LoadingSpinner } from "./loading-spinner";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";
import { HeroCard } from "./hero-card";
import { HeroDots } from "./hero-dots";

const FEATURED_BADGES = {
  slide1: "おすすめ",
  slide2: "人気",
  slide3: "特選",
  slide4: "デザート",
  slide5: "NEW",
} as const;

export function HeroSection() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [api, setApi] = React.useState<any>();
  const [current, setCurrent] = React.useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const menuItems = useMenuStore((state) => state.items);
  const featuredItems = useFeaturedStore((state) => state.featuredItems);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const colorScheme = COLOR_THEMES[currentTheme];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const getFeaturedItems = () => {
    return Object.entries(featuredItems)
      .map(([type, id]) => {
        if (!id) return null;
        const item = menuItems.find(item => String(item.id) === id);
        if (!item) return null;
        return {
          ...item,
          badge: FEATURED_BADGES[type as keyof typeof FEATURED_BADGES],
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addItem({
      id: String(item.id),
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    });

    toast({
      title: "カートに追加しました",
      description: `${item.name}をカートに追加しました`,
    });
  };

  const items = getFeaturedItems();

  if (isLoading) {
    return (
      <div className="relative aspect-square bg-muted flex items-center justify-center rounded">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent className="-ml-1">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-1 basis-[90%]"
              data-testid={`hero-slide-${item.id}`}
            >
              <HeroCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="left-1 landscape:left-4"
          style={{ color: colorScheme.heroCarouselArrow }}
          data-testid="hero-prev"
        />
        <CarouselNext
          className="right-1 landscape:right-4"
          style={{ color: colorScheme.heroCarouselArrow }}
          data-testid="hero-next"
        />
      </Carousel>

      {/* Dot Indicators */}
      <HeroDots
        count={items.length}
        current={current}
        onSelect={(i) => api?.scrollTo(i)}
      />
    </div>
  );
}
