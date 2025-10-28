"use client";

import { History, Receipt, Bell, Languages, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";

export default function Navigation() {
  const [isVisible, setIsVisible] = useState(true);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const colorScheme = COLOR_THEMES[currentTheme];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // スクロール中は非表示
      setIsVisible(false);

      // タイムアウトをクリア
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // スクロールが止まったら500ms後に表示
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-transform duration-300 flex justify-center ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className="w-full max-w-md portrait:max-w-sm landscape:max-w-4xl px-4"
        style={{ backgroundColor: colorScheme.headerBg }}
      >
        <div className="flex flex-col items-center py-2 border-b">
          <div className="flex items-center space-x-2">
            <Link href="/order-history">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1.5 h-auto py-3 px-4">
                <History className="h-7 w-7" style={{ color: colorScheme.headerIcon }} />
                <span className="text-sm font-medium" style={{ color: colorScheme.navigationText }}>履歴</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1.5 h-auto py-3 px-4">
              <Bell className="h-7 w-7" style={{ color: colorScheme.headerIcon }} />
              <span className="text-sm font-medium" style={{ color: colorScheme.navigationText }}>呼出</span>
            </Button>
            <Link href="/payment">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1.5 h-auto py-3 px-4">
                <Receipt className="h-7 w-7" style={{ color: colorScheme.headerIcon }} />
                <span className="text-sm font-medium" style={{ color: colorScheme.navigationText }}>会計</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1.5 h-auto py-3 px-4">
              <Languages className="h-7 w-7" style={{ color: colorScheme.headerIcon }} />
              <span className="text-sm font-medium" style={{ color: colorScheme.navigationText }}>Lang</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1.5 h-auto py-3 px-4">
              <Search className="h-7 w-7" style={{ color: colorScheme.headerIcon }} />
              <span className="text-sm font-medium" style={{ color: colorScheme.navigationText }}>検索</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}