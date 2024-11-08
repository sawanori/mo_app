"use client";

import React, { useState, useEffect } from "react";
import { useOrderStore } from "@/lib/store/orders";
import { useMenuStore } from "@/lib/store/menu";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProductModal } from "./product-modal";
import { MenuItem } from "@/lib/store/menu";
import { LoadingSpinner } from "./loading-spinner";

interface MenuSectionProps {
  selectedCategory: string;
}

export function MenuSection({ selectedCategory }: MenuSectionProps) {
  const orders = useOrderStore((state) => state.orders);
  const menuItems = useMenuStore((state) => state.items);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const isOrdered = (itemId: number) => {
    return orders.some(order => 
      order.items.some(item => Number(item.id) === itemId)
    );
  };

  const filteredItems = selectedCategory === "すべて" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => setSelectedItem(item)}
          >
            <div className="relative aspect-video">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle>{item.name}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{item.category}</Badge>
                    {isOrdered(item.id) && (
                      <Badge variant="default">注文済み</Badge>
                    )}
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(item.price)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <ProductModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}