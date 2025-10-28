"use client";

import { useState } from "react";
import { useOrderStore } from "@/lib/store/orders";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, History, Receipt } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Navigation from "@/components/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentPage() {
  const [isCallStaff, setIsCallStaff] = useState(false);
  const { pendingPaymentOrders } = useOrderStore();
  const { items: cartItems, total: cartTotal } = useCartStore();

  const orderSubtotal = pendingPaymentOrders.reduce((sum, order) => 
    sum + order.items.reduce((orderSum, item) => orderSum + (item.price * item.quantity), 0), 0);
  const cartSubtotal = cartTotal();
  const subtotal = orderSubtotal + cartSubtotal;
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  if (isCallStaff) {
    return (
      <>
        <Navigation />
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
          <div className="w-full px-3 py-6 space-y-4">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-6">
                <Bell className="h-16 w-16 text-primary animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">スタッフをお呼びください</h2>
                <p className="text-muted-foreground">
                  スタッフが会計のお手続きにまいります。
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-4">
                <div className="text-xl font-bold border-b pb-4">
                  お支払い金額: {formatPrice(total)}
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                        <TableHead className="text-right">小計</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPaymentOrders.map((order) => (
                        order.items.map((item) => (
                          <TableRow key={`${order.id}-${item.id}`}>
                            <TableCell className="py-2">{item.name}</TableCell>
                            <TableCell className="text-right py-2">{item.quantity}</TableCell>
                            <TableCell className="text-right py-2">
                              {formatPrice(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))
                      ))}
                      {cartItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="py-2">{item.name}</TableCell>
                          <TableCell className="text-right py-2">{item.quantity}</TableCell>
                          <TableCell className="text-right py-2">
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-medium py-2">小計</TableCell>
                        <TableCell className="text-right font-medium py-2">{formatPrice(subtotal)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-medium py-2">消費税（10%）</TableCell>
                        <TableCell className="text-right font-medium py-2">{formatPrice(tax)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-bold py-2">合計</TableCell>
                        <TableCell className="text-right font-bold py-2">{formatPrice(total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="w-full px-3 py-6 space-y-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-2xl font-bold">会計</h1>
            <Link href="/order-history">
              <Button variant="outline" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                注文履歴
              </Button>
            </Link>
          </div>

          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col border-b pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">お会計</h2>
                  <p className="text-sm text-muted-foreground">
                    注文内容をご確認の上、会計ボタンを押してください
                  </p>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatPrice(total)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">小計</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPaymentOrders.map((order) => (
                      order.items.map((item) => (
                        <TableRow key={`${order.id}-${item.id}`}>
                          <TableCell className="py-2">{item.name}</TableCell>
                          <TableCell className="text-right py-2">{item.quantity}</TableCell>
                          <TableCell className="text-right py-2">
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))
                    ))}
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-2">{item.name}</TableCell>
                        <TableCell className="text-right py-2">{item.quantity}</TableCell>
                        <TableCell className="text-right py-2">
                          {formatPrice(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-medium py-2">小計</TableCell>
                      <TableCell className="text-right font-medium py-2">{formatPrice(subtotal)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-medium py-2">消費税（10%）</TableCell>
                      <TableCell className="text-right font-medium py-2">{formatPrice(tax)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-bold py-2">合計</TableCell>
                      <TableCell className="text-right font-bold py-2">{formatPrice(total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Button 
                size="lg" 
                onClick={() => setIsCallStaff(true)}
                className="w-full gap-2"
              >
                <Receipt className="h-5 w-5" />
                会計する
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}