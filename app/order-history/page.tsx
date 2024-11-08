"use client";

import { useOrderStore } from "@/lib/store/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function OrderHistoryPage() {
  const { orders } = useOrderStore();

  if (orders.length === 0) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <ClipboardList className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">注文履歴がありません</h2>
            <p className="text-muted-foreground">注文をしてください</p>
            <Link href="/">
              <Button>メニューに戻る</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">注文履歴</h1>
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      注文日時: {new Date(order.timestamp).toLocaleString('ja-JP')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      テーブル番号: {order.tableNumber}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={order.status === 'completed' ? 'success' : 'secondary'}>
                      {order.status === 'completed' ? '提供完了' : '準備中'}
                    </Badge>
                    <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'destructive'}>
                      {order.paymentStatus === 'paid' ? '会計済み' : '未会計'}
                    </Badge>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">価格</TableHead>
                      <TableHead className="text-right">小計</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        合計（税込）
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPrice(order.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}