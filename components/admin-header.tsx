"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { LogOut } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">管理画面</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
}