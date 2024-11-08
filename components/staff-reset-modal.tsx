"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useOrderStore } from "@/lib/store/orders";
import { useCartStore } from "@/lib/store/cart";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StaffResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAFF_PASSWORD = "1234!"; // 実際の運用では環境変数などで管理することを推奨

export function StaffResetModal({ isOpen, onClose }: StaffResetModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clearHistory, setClearHistory] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const { clearPendingPayments, clearOrders } = useOrderStore();
  const clearCart = useCartStore((state) => state.clearCart);

  const handleReset = async () => {
    setIsLoading(true);

    try {
      if (password !== STAFF_PASSWORD) {
        toast({
          title: "パスワードが違います",
          variant: "destructive",
        });
        return;
      }

      // 会計データをリセット
      clearPendingPayments();
      clearCart();

      // 注文履歴もクリアするオプション
      if (clearHistory) {
        clearOrders();
      }

      toast({
        title: "リセット完了",
        description: clearHistory 
          ? "会計データと注文履歴をリセットしました"
          : "会計データをリセットしました",
      });

      // 強制的にページをリロード
      window.location.reload();
    } finally {
      setIsLoading(false);
      onClose();
      setPassword("");
      setClearHistory(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>スタッフ確認</DialogTitle>
          <DialogDescription>
            会計データをリセットするには、スタッフパスワードを入力してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Input
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clearHistory"
              checked={clearHistory}
              onCheckedChange={(checked) => setClearHistory(checked as boolean)}
            />
            <Label htmlFor="clearHistory">注文履歴もリセットする</Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button 
              onClick={handleReset}
              disabled={!password || isLoading}
            >
              リセット
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}