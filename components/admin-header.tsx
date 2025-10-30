"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { LogOut, Upload, LayoutDashboard } from "lucide-react";

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
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">管理画面</h1>
            <nav className="flex space-x-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  ダッシュボード
                </Button>
              </Link>
              <Link href="/admin/import">
                <Button variant="ghost" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  メニューインポート
                </Button>
              </Link>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
}