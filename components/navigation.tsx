"use client";

import { History, Receipt, Bell, Languages, Search } from "lucide-react";
// imports removed: Link, Button (moved into NavButton)
import { useState, useEffect, useRef } from "react";
import { useThemeStore, COLOR_THEMES } from "@/lib/store/theme";
import { NavButton } from "./nav-button";

export default function Navigation() {
  const [isVisible, setIsVisible] = useState(true);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const colorScheme = COLOR_THEMES[currentTheme];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <nav
      className="fixed left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: colorScheme.headerBg,
        top: isVisible ? '0px' : '-100px'
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
