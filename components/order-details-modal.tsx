"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { OrderItem } from "@/types/orders";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: number;
    tableNumber: number;
    items: OrderItem[];
    status: "pending" | "completed";
    timestamp: string;
  };
}

export function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>注文詳細</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                注文時刻: {formatTime(order.timestamp)}
              </p>
              <p className="text-sm text-muted-foreground">
                テーブル番号: {order.tableNumber}
              </p>
            </div>
            <Badge variant="success">
              {order.status === "completed" ? "提供完了" : "準備中"}
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品名</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">単価</TableHead>
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
                  小計
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatPrice(calculateTotal(order.items))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  消費税（10%）
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatPrice(Math.floor(calculateTotal(order.items) * 0.1))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  合計
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatPrice(calculateTotal(order.items) * 1.1)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}