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
    <footer
      className={`fixed bottom-0 left-0 right-0 z-40 w-full overflow-hidden transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ backgroundColor: colorScheme.footerBg }}
    >
      <div className="flex flex-col items-center py-2 border-t max-w-full">
          <div className="flex items-center justify-between gap-2 w-full px-2 max-w-full">
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2 px-2 flex-1 min-w-0">
              <Ticket className="h-6 w-6" style={{ color: colorScheme.headerIcon }} />
              <span className="text-[10px] font-medium" style={{ color: colorScheme.navigationText }}>クーポン</span>
            </Button>
            <Link href="/" className="flex-1 min-w-0">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2 px-2 relative w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500" />
                </div>
                <UtensilsCrossed className="h-6 w-6 relative z-10 flex-shrink-0" style={{ color: colorScheme.headerIcon }} />
                <span className="text-[10px] font-medium relative z-10 whitespace-nowrap" style={{ color: colorScheme.navigationText }}>メニュー</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-2 px-2 flex-1 min-w-0">
              <Award className="h-6 w-6" style={{ color: colorScheme.headerIcon }} />
              <span className="text-[10px] font-medium" style={{ color: colorScheme.navigationText }}>スタンプラリー</span>
            </Button>
          </div>
        </div>
    </footer>
  );
}
