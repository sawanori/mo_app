"use client";

import { useEffect, useRef, useState } from "react";

export function useStickySidebar(sidebarRef: React.RefObject<HTMLElement>) {
  const [isFixed, setIsFixed] = useState(false);
  const initialTopRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return;

      // Get initial position on first scroll
      if (initialTopRef.current === null) {
        const rect = sidebarRef.current.getBoundingClientRect();
        initialTopRef.current = rect.top + window.scrollY;
      }

      const scrollY = window.scrollY;
      const shouldBeFixed = scrollY >= initialTopRef.current;

      if (shouldBeFixed !== isFixed) {
        setIsFixed(shouldBeFixed);
      }
    };

    // Call once to set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFixed, sidebarRef]);

  return { isFixed } as const;
}

