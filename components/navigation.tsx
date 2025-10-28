"use client";

import { History, Receipt, Bell, Languages, Search } from "lucide-react";
// imports removed: Link, Button (moved into NavButton)
import { useState, useEffect } from "react";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";
import { NavButton } from "./nav-button";

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
      className="sticky top-0 z-50 w-full overflow-hidden transition-transform duration-300 ease-in-out"
      style={{
        backgroundColor: colorScheme.headerBg,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="flex flex-col items-center py-2 border-b max-w-full">
        <div className="flex items-center justify-between gap-1 w-full px-2 max-w-full">
          <NavButton
            icon={History}
            label="履歴"
            href="/order-history"
            color={colorScheme.headerIcon}
            textColor={colorScheme.navigationText}
            testId="nav-history"
          />
          <NavButton
            icon={Bell}
            label="呼出"
            color={colorScheme.headerIcon}
            textColor={colorScheme.navigationText}
            testId="nav-call"
          />
          <NavButton
            icon={Receipt}
            label="会計"
            href="/payment"
            color={colorScheme.headerIcon}
            textColor={colorScheme.navigationText}
            testId="nav-payment"
          />
          <NavButton
            icon={Languages}
            label="Lang"
            color={colorScheme.headerIcon}
            textColor={colorScheme.navigationText}
            testId="nav-language"
          />
          <NavButton
            icon={Search}
            label="検索"
            color={colorScheme.headerIcon}
            textColor={colorScheme.navigationText}
            testId="nav-search"
          />
        </div>
      </div>
    </nav>
  );
}
