"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { useCartStore } from "@/lib/store/cart";
import { useToast } from "@/components/ui/use-toast";
import { MenuItem } from "@/lib/store/menu";

interface ProductModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ item, isOpen, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: String(item.id),
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image
    });
    toast({
      title: "カートに追加しました",
      description: `${item.name} × ${quantity}をカートに追加しました`,
    });
    onClose();
    setQuantity(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto p-4 gap-4">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-bold leading-tight">{item.name}</DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{item.category}</Badge>
            <span className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
          
          <p className="text-sm text-muted-foreground">{item.description}</p>

          <div className="flex items-center justify-between py-4 border-t border-b">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-lg font-bold">
              {formatPrice(item.price * quantity)}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleAddToCart}
            className="w-full"
          >
            カートに追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}