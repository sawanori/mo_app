"use client";

import { useEffect, useRef, useState } from "react";

export function useStickySidebar(sidebarTopRef: React.RefObject<HTMLDivElement>) {
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollYRef = useRef(0);
  const stickyStartPositionRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarTopRef.current) return;

      const rect = sidebarTopRef.current.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollYRef.current;

      // サブカテゴリーがデバイスのTOPに到達したらスティッキーを開始
      if (rect.top <= 0 && !isSticky) {
        setIsSticky(true);
        stickyStartPositionRef.current = currentScrollY;
      } else if (isSticky && scrollingDown && currentScrollY - stickyStartPositionRef.current > 300) {
        setIsSticky(false);
      } else if (isSticky && !scrollingDown && rect.top > 0) {
        setIsSticky(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSticky, sidebarTopRef]);

  return { isSticky } as const;
}

