"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { AdminHeader } from "@/components/admin-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Clock, History, CreditCard, Ban, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrderStore } from "@/lib/store/orders";
import { useCartStore } from "@/lib/store/cart";
import { OrderDetailsModal } from "@/components/order-details-modal";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  status: "pending" | "completed";
}

interface Order {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  status: "pending" | "completed";
  paymentStatus: "unpaid" | "paid";
  timestamp: string;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const clearCart = useCartStore((state) => state.clearCart);
  const { clearOrdersByTable } = useOrderStore();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      tableNumber: 1,
      items: [
        { id: 1, name: "チーズバーガー", quantity: 2, price: 580, status: "pending" },
        { id: 2, name: "フライドポテト", quantity: 1, price: 320, status: "completed" },
        { id: 3, name: "コーラ", quantity: 2, price: 220, status: "pending" },
      ],
      status: "pending",
      paymentStatus: "unpaid",
      timestamp: "2024-03-15T12:30:00",
    },
    {
      id: 2,
      tableNumber: 3,
      items: [
        { id: 4, name: "アボカドバーガー", quantity: 1, price: 680, status: "pending" },
        { id: 5, name: "オニオンリング", quantity: 1, price: 280, status: "pending" },
      ],
      status: "pending",
      paymentStatus: "unpaid",
      timestamp: "2024-03-15T12:35:00",
    },
  ]);

  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  const handleCompleteItem = (orderId: number, itemId: number) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item =>
          item.id === itemId ? { ...item, status: "completed" } : item
        );
        const allCompleted = updatedItems.every(item => item.status === "completed");
        return {
          ...order,
          items: updatedItems,
          status: allCompleted ? "completed" : "pending",
        };
      }
      return order;
    }));

    toast({
      title: "商品を提供完了しました",
      description: "注文アイテムのステータスを更新しました。",
    });
  };

  const handlePaymentComplete = (orderId: number) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const allItemsCompleted = targetOrder.items.every(item => item.status === "completed");
    if (!allItemsCompleted) {
      toast({
        title: "会計完了できません",
        description: "全ての商品の提供を完了してください。",
        variant: "destructive",
      });
      return;
    }

    // 該当テーブルの注文履歴と会計データをリセット
    clearOrdersByTable(targetOrder.tableNumber);
    clearCart();

    // 注文を完了済みリストに移動
    const updatedOrder = { ...targetOrder, paymentStatus: "paid" };
    setCompletedOrders([updatedOrder, ...completedOrders]);
    setOrders(orders.filter(order => order.id !== orderId));

    toast({
      title: "会計完了",
      description: `テーブル ${targetOrder.tableNumber} の会計が完了しました。`,
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">オーダー管理</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>未提供</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>提供済み</span>
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              <span>未会計</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <span>会計済み</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              進行中の注文
              <Badge variant="secondary" className="ml-2">
                {orders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              会計履歴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid gap-6 md:grid-cols-2">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-bold">テーブル {order.tableNumber}</h2>
                      <p className="text-sm text-muted-foreground">
                        注文時刻: {formatTime(order.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {order.items.filter(item => item.status === "pending").length} 品目
                      </Badge>
                      {order.paymentStatus === "paid" ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          会計済み
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Ban className="h-3 w-3" />
                          未会計
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                        <TableHead className="text-right">状態</TableHead>
                        <TableHead className="text-right">アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.status === "completed" ? (
                              <Badge variant="success">提供済み</Badge>
                            ) : (
                              <Badge variant="warning">未提供</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteItem(order.id, item.id)}
                              disabled={item.status === "completed"}
                            >
                              提供完了
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex justify-between items-center pt-4 border-t">
                    <div className="font-semibold">
                      合計: {formatPrice(calculateTotal(order.items))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === "completed" ? "success" : "warning"}>
                        {order.status === "completed" ? "完了" : "進行中"}
                      </Badge>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePaymentComplete(order.id)}
                        disabled={order.paymentStatus === "paid" || !order.items.every(item => item.status === "completed")}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        会計完了
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>注文時刻</TableHead>
                    <TableHead>テーブル</TableHead>
                    <TableHead>注文内容</TableHead>
                    <TableHead className="text-right">合計金額</TableHead>
                    <TableHead className="text-right">状態</TableHead>
                    <TableHead className="text-right">会計</TableHead>
                    <TableHead className="text-right">詳細</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{formatTime(order.timestamp)}</TableCell>
                      <TableCell>テーブル {order.tableNumber}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate">
                          {order.items.map(item => `${item.name} x${item.quantity}`).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(calculateTotal(order.items))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success">完了</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success" className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          会計済み
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}