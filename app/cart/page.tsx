"use client";

import { useCartStore } from "@/lib/store/cart";
import { useOrderStore } from "@/lib/store/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleOrder = () => {
    if (items.length === 0) return;

    const subtotal = total();
    const tax = Math.floor(subtotal * 0.1);
    const finalTotal = subtotal + tax;

    addOrder(items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })), finalTotal);

    clearCart();
    
    toast({
      title: "注文を受け付けました",
      description: "注文履歴から確認できます",
    });
    
    router.push("/order-history");
  };

  if (items.length === 0) {
    return (
      <>
        <Navigation />
        <div className="w-full px-3 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">カートは空です</h2>
            <p className="text-muted-foreground">商品を追加してください</p>
            <Link href="/">
              <Button>メニューに戻る</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const subtotal = total();
  const tax = Math.floor(subtotal * 0.1);
  const finalTotal = subtotal + tax;

  return (
    <>
      <Navigation />
      <div className="w-full px-3 py-8">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-8">ショッピングカート</h1>
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-muted-foreground">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="ml-auto"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">注文サマリー</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>小計</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>消費税（10%）</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>合計</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleOrder}
                  >
                    注文する
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full" size="lg">
                      メニューに戻る
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}