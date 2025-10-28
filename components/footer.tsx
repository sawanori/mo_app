"use client";

import { Ticket, UtensilsCrossed, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";
import { useState, useEffect } from "react";

export default function Footer() {
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
    <footer className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center transition-transform duration-300 ${
      isVisible ? "translate-y-0" : "translate-y-full"
    }`}>
      <div
        className="w-full max-w-md portrait:max-w-sm landscape:max-w-4xl px-4"
        style={{ backgroundColor: colorScheme.footerBg }}
      >
        <div className="flex flex-col items-center py-2 border-t">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
              <Ticket className="h-6 w-6" style={{ color: colorScheme.headerIcon }} />
              <span className="text-[10px] font-medium" style={{ color: colorScheme.navigationText }}>クーポン</span>
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500/20 border-2 border-orange-500" />
                </div>
                <UtensilsCrossed className="h-6 w-6 relative z-10" style={{ color: colorScheme.headerIcon }} />
                <span className="text-[10px] font-medium relative z-10" style={{ color: colorScheme.navigationText }}>メニュー</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
              <Award className="h-6 w-6" style={{ color: colorScheme.headerIcon }} />
              <span className="text-[10px] font-medium" style={{ color: colorScheme.navigationText }}>スタンプラリー</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
