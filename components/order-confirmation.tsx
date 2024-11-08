"use client";

import { useCartStore } from "@/lib/store/cart";
import { useOrderStore } from "@/lib/store/orders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export function OrderConfirmation() {
  const { items, total, clearCart } = useCartStore();
  const { addOrder, addToPendingPayment } = useOrderStore();
  const { toast } = useToast();

  if (items.length === 0) {
    return null;
  }

  const subtotal = total();
  const tax = Math.floor(subtotal * 0.1);
  const finalTotal = subtotal + tax;

  const handleOrder = () => {
    const order = {
      id: Math.random().toString(36).substring(7),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      status: 'pending' as const,
      paymentStatus: 'unpaid' as const,
      timestamp: new Date().toISOString(),
      total: finalTotal,
      tableNumber: 1,
    };

    addOrder(items, finalTotal);
    addToPendingPayment(order);
    clearCart();
    
    toast({
      title: "注文を受け付けました",
      description: "ご注文ありがとうございます",
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto px-4 py-3 max-w-md">
        <Button 
          onClick={handleOrder} 
          className="w-full shadow-lg flex items-center justify-between h-14"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <span>注文を確定する</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{items.reduce((sum, item) => sum + item.quantity, 0)}点</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </Button>
      </div>
    </div>
  );
}