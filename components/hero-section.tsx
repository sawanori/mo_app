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

const FEATURED_BADGES = {
  monthly: "今月のおすすめ",
  limited: "期間限定",
  new: "新メニュー",
} as const;

// YouTubeの動画ID
const YOUTUBE_VIDEO_ID = "knodCMLkYA0"; // この動画IDを実際のものに置き換えてください

export function HeroSection() {
  const [isLoading, setIsLoading] = React.useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const menuItems = useMenuStore((state) => state.items);
  const featuredItems = useFeaturedStore((state) => state.featuredItems);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="relative aspect-[16/12] sm:aspect-[21/9] md:aspect-[21/7] bg-muted flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {/* YouTube動画スライド */}
          <CarouselItem className="min-w-0">
            <Card className="relative overflow-hidden">
              <div className="relative aspect-[16/12] sm:aspect-[21/9] md:aspect-[21/7]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playsinline=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ pointerEvents: 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6 md:p-12 text-white pointer-events-none">
                  <div className="inline-block px-3 py-1 mb-2 sm:mb-4 text-xs sm:text-sm font-semibold bg-primary rounded-full w-fit">
                    スペシャルプロモーション
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2 md:mb-4 leading-tight">
                    美味しさの瞬間を、あなたに
                  </h2>
                  <p className="text-sm sm:text-base md:text-xl mb-3 sm:mb-4 max-w-xl line-clamp-2 sm:line-clamp-none text-gray-100">
                    厳選された食材と職人の技が織りなす至福のひととき
                  </p>
                </div>
              </div>
            </Card>
          </CarouselItem>

          {/* 商品スライド */}
          {items.map((item) => (
            <CarouselItem key={item.id} className="min-w-0">
              <Card className="relative overflow-hidden">
                <div className="relative aspect-[16/12] sm:aspect-[21/9] md:aspect-[21/7]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover brightness-[0.65]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6 md:p-12 text-white">
                    <div className="inline-block px-3 py-1 mb-2 sm:mb-4 text-xs sm:text-sm font-semibold bg-primary rounded-full w-fit">
                      {item.badge}
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2 md:mb-4 leading-tight">
                      {item.name}
                    </h2>
                    <p className="text-sm sm:text-base md:text-xl mb-3 sm:mb-4 max-w-xl line-clamp-2 sm:line-clamp-none text-gray-100">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                        {formatPrice(item.price)}
                      </span>
                      <Button 
                        size="sm" 
                        className="gap-1.5 sm:gap-2" 
                        variant="secondary"
                        onClick={() => handleAddToCart(item)}
                      >
                        注文する
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 sm:left-4" />
        <CarouselNext className="right-2 sm:right-4" />
      </Carousel>
    </div>
  );
}