"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

const orderHistory = [
  {
    id: 1,
    date: "2024-03-15",
    items: ["ハンバーガー", "フライドポテト", "コーラ"],
    total: 1000,
    status: "完了",
  },
  {
    id: 2,
    date: "2024-03-14",
    items: ["チーズバーガー", "コーラ"],
    total: 800,
    status: "完了",
  },
];

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">アカウント情報</h2>
            <Button variant="outline">編集</Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">お名前</label>
              <p className="text-lg">山田 太郎</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">メールアドレス</label>
              <p className="text-lg">yamada@example.com</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">電話番号</label>
              <p className="text-lg">090-1234-5678</p>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-6 w-6" />
            <h2 className="text-2xl font-bold">注文履歴</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>注文日</TableHead>
                <TableHead>注文内容</TableHead>
                <TableHead>合計</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderHistory.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.items.join(", ")}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}