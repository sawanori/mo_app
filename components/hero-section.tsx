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
    <div className="relative">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-[85%] md:basis-[80%]">
              <Card className="relative overflow-hidden rounded-3xl">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="left-1 landscape:left-4"
          style={{ color: colorScheme.heroCarouselArrow }}
        />
        <CarouselNext
          className="right-1 landscape:right-4"
          style={{ color: colorScheme.heroCarouselArrow }}
        />
      </Carousel>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-3">
        {items.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === current
                ? "bg-orange-500"
                : "bg-muted-foreground/30"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}