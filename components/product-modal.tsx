"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
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
    <AnimatePresence mode="wait">
      {isOpen && (
        <Dialog key={`modal-${item.id}`} open={isOpen} onOpenChange={onClose}>
          <DialogContent
            key={isOpen ? 'open' : 'closed'}
            className="p-0 gap-0 overflow-hidden"
            data-testid="product-modal"
            data-item-id={item.id}
          >
            {item.image && item.image.trim() !== "" && (
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                {item.mediaType === 'video' ? (
                  <video
                    src={item.image}
                    className="absolute inset-0 w-full h-full object-cover"
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
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                )}
              </div>
            )}

            <div className="p-4 space-y-4">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-xl font-bold leading-tight">{item.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">{item.description}</p>

              <DialogFooter className="flex-col gap-2">
              <div className="flex items-center gap-2 w-full">
                <div className="flex items-center gap-2 border rounded-md px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8"
                    data-testid="qty-decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-base font-semibold w-6 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    className="h-8 w-8"
                    data-testid="qty-increase"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                  data-testid="add-to-cart"
                >
                  カートに追加 {formatPrice(item.price * quantity)}
                </Button>
              </div>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
